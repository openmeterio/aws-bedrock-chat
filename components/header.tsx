import React from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { clearChats } from '@/app/actions'
import { authOptions } from '@/auth'
import { ClearHistory } from '@/components/clear-history'
import { LoginButton } from '@/components/login-button'
import { Sidebar } from '@/components/sidebar'
import { SidebarFooter } from '@/components/sidebar-footer'
import { SidebarList } from '@/components/sidebar-list'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button, buttonVariants } from '@/components/ui/button'
import { IconGitHub, IconNextChat, IconSeparator } from '@/components/ui/icons'
import { UserMenu } from '@/components/user-menu'
import { cn } from '@/lib/utils'

export async function Header() {
  const session = await getServerSession(authOptions)
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-gradient-to-b from-background/10 via-background/50 to-background/80 px-4 backdrop-blur-xl">
      <div className="flex items-center">
        {session?.user ? (
          <Sidebar>
            <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
              {/* @ts-ignore */}
              <SidebarList userId={session?.user?.id} />
            </React.Suspense>
            <SidebarFooter>
              <ThemeToggle />
              <ClearHistory clearChats={clearChats} />
            </SidebarFooter>
          </Sidebar>
        ) : (
          <Link href="/" rel="nofollow" target="_blank">
            <IconNextChat inverted className="mr-2 h-6 w-6 dark:hidden" />
            <IconNextChat className="mr-2 hidden h-6 w-6 dark:block" />
          </Link>
        )}
        <div className="flex items-center">
          <IconSeparator className="h-6 w-6 text-muted-foreground/50" />
          {session?.user ? (
            <UserMenu user={session.user} />
          ) : (
            <Button asChild className="-ml-2" variant="link">
              <Link href="/api/auth/signin?callbackUrl=/">Login</Link>
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <a
          className={cn(buttonVariants({ variant: 'outline' }))}
          href="https://github.com/openmeterio/aws-bedrock-chat/"
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconGitHub />
          <span className="ml-2 hidden md:flex">GitHub</span>
        </a>
      </div>
    </header>
  )
}
