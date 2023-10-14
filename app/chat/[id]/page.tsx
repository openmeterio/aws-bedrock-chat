import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getChat } from '@/app/actions'
import { authOptions } from '@/auth'
import { Chat } from '@/components/chat'
import { UsageChart } from '@/components/usage'

export const preferredRegion = 'home'

export interface ChatPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params,
}: ChatPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return {}
  }

  const chat = await getChat(params.id, session.user.id)
  return {
    title: chat?.title.toString().slice(0, 50) ?? 'Chat',
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await getServerSession(authOptions)

  const userId = session?.user.id
  if (!userId) {
    return redirect('/api/auth/signin?callbackUrl=/chat')
  }

  const chat = await getChat(params.id, userId)
  if (!chat) {
    notFound()
  }

  if (chat?.userId !== userId) {
    notFound()
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="sticky top-16 z-10 bg-slate-200/50 pt-6 backdrop-blur-lg">
        <UsageChart />
      </div>
      <div className="relative flex-1">
        <Chat id={chat.id} initialMessages={chat.messages} />
      </div>
    </div>
  )
}
