import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/50 text-zinc-100 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white mt-4">Authentication Error</CardTitle>
          <CardDescription className="text-zinc-400">
            We couldn't exchange your authentication code for a valid session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-sm text-zinc-400">
          <p>
            This error usually occurs when the authentication code has expired, has already been used, or the redirect configuration is incorrect.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link
            href="/login"
            className="w-full h-9 flex items-center justify-center rounded-md bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-medium transition-colors"
          >
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
