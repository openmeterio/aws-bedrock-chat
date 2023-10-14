import withAuth from 'next-auth/middleware'
import { NextRequest, NextResponse } from 'next/server'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
