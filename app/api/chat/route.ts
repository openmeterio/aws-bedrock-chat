import { Event, OpenMeter } from '@openmeter/sdk'
import { ChatRequest, Message, StreamingTextResponse } from 'ai'
import dayjs from 'dayjs'
import {
  ChatBedrock,
  convertMessagesToPromptAnthropic,
} from 'langchain/chat_models/bedrock'
import { AIMessage, ChatMessage, HumanMessage } from 'langchain/schema'
import { BytesOutputParser } from 'langchain/schema/output_parser'
import { getServerSession } from 'next-auth'
import { saveChat } from '@/app/actions'
import { authOptions } from '@/auth'
import { nanoid } from '@/lib/utils'

let om: OpenMeter | undefined
if (process.env.OPENMETER_BASE_URL) {
  om = new OpenMeter({
    baseUrl: process.env.OPENMETER_BASE_URL,
    token: process.env.OPENMETER_TOKEN,
  })
}

let TOKEN_LIMIT: number | undefined
if (process.env.TOKEN_LIMIT) {
  TOKEN_LIMIT = Number.parseInt(process.env.TOKEN_LIMIT, 10)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = session?.user.id
  if (!userId) {
    return new Response('Unauthorized', {
      status: 401,
    })
  }

  if (TOKEN_LIMIT) {
    const from = dayjs().subtract(1, 'day').toDate()
    const to = dayjs().toDate()
    const usageResp = await om?.meters.query('total_tokens', {
      from,
      to,
      subject: [userId],
    })
    const usage = usageResp?.data.find((u) => u.subject === userId)?.value ?? 0
    if (usage >= TOKEN_LIMIT) {
      console.log('Usage limit reached', usage)
      return new Response('Usage limit reached', {
        status: 429,
        headers: {
          'retry-after': '3600',
        },
      })
    }
  }

  const { id = nanoid(), messages }: ChatRequest & { id?: string } =
    await req.json()
  const createdAt = new Date()

  const llm = new ChatBedrock({
    temperature: 0.1,
    model: 'anthropic.claude-v2',
    region: process.env.AWS_REGION,
    maxTokens: 2048 * 2,
  })

  const propmt = messages.map(convertVercelMessageToLangChainMessage)

  llm.callbacks = [
    {
      async handleLLMEnd({ generations }, runId) {
        // save chat
        await saveChat({
          id,
          userId,
          title: messages[0].content.substring(0, 100),
          path: `/chat/${id}`,
          createdAt,
          messages: messages.concat(
            generations.flat().map((g) => ({
              id: nanoid(),
              role: 'assistant',
              content: g.text,
            })),
          ),
        })

        // ingest usage to OpenMeter
        try {
          const input = convertMessagesToPromptAnthropic(propmt)
          const output = generations
            .flat()
            .map((g) => g.text)
            .join('')
          const data = {
            input: await llm.getNumTokens(input),
            output: await llm.getNumTokens(output),
          }

          const event: Event = {
            id: runId,
            subject: userId,
            type: 'chat',
            source: 'langchain',
            time: createdAt,
            data: {
              ...data,
              total: data.input + data.output,
              model: llm.model,
            },
          }

          await om?.events.ingest(event)
          console.log('Usage event', event)
        } catch (err) {
          console.error('Failed to ingest event to OpenMeter', err)
        }
      },
    },
  ]

  try {
    const outputParser = new BytesOutputParser()
    const chain = llm.bind({ signal: req.signal }).pipe(outputParser)
    const stream = await chain.stream(propmt)

    return new StreamingTextResponse(stream)
  } catch (err) {
    console.error(err)
    return new Response('Internal Server Error', {
      status: 500,
    })
  }
}

function convertVercelMessageToLangChainMessage(message: Message) {
  if (message.role === 'user') {
    return new HumanMessage(message)
  }

  if (message.role === 'assistant') {
    return new AIMessage(message)
  }

  return new ChatMessage(message)
}
