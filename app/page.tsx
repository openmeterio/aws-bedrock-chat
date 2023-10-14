import { Chat } from '@/components/chat'
import { UsageChart } from '@/components/usage'
import { nanoid } from '@/lib/utils'

export const revalidate = 10 // 10 seconds

export default function IndexPage() {
  const id = nanoid()

  return (
    <div className="flex flex-col space-y-6">
      <div className="sticky top-16 z-10 bg-slate-200/50 pt-6 backdrop-blur-lg">
        <UsageChart />
      </div>
      <div className="relative flex-1">
        <Chat id={id} />
      </div>
    </div>
  )
}
