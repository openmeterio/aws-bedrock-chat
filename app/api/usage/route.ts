import { OpenMeter, WindowSize } from '@openmeter/sdk'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'

let om: OpenMeter | undefined
if (process.env.OPENMETER_BASE_URL) {
  om = new OpenMeter({
    baseUrl: process.env.OPENMETER_BASE_URL,
    token: process.env.OPENMETER_TOKEN,
  })
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = session?.user.id
  if (!userId) {
    return new Response('Unauthorized', {
      status: 401,
    })
  }

  const params = new URL(req.url).searchParams
  let windowSize: WindowSize | undefined
  switch (params.get('windowSize')) {
    case WindowSize.MINUTE:
      windowSize = WindowSize.MINUTE
      break
    case WindowSize.HOUR:
      windowSize = WindowSize.HOUR
      break
    case WindowSize.DAY:
      windowSize = WindowSize.DAY
      break
  }

  const usage = await om?.meters.query('total_tokens', {
    windowSize,
    subject: [userId],
  })

  return new Response(JSON.stringify(usage), {
    headers: {
      'content-type': 'application/json',
    },
  })
}
