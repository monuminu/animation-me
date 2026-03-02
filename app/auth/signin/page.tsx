'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password. Password is "dev" for all accounts.')
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-6 shadow-2xl shadow-black/20">
      <h1 className="text-lg font-semibold text-center mb-1">Welcome back</h1>
      <p className="text-sm text-text-muted text-center mb-6">
        Sign in to save and manage your projects
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="flex h-10 w-full rounded-lg bg-bg-elevated border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0 transition-colors duration-200"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
            className="flex h-10 w-full rounded-lg bg-bg-elevated border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0 transition-colors duration-200"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full h-10 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-accent/30 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-text-muted text-center mt-4">
        New here? Just enter any email with password <code className="text-text-secondary bg-bg-elevated px-1.5 py-0.5 rounded text-xs font-mono">dev</code> to create an account.
      </p>
    </div>
  )
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight">animation.me</span>
        </Link>

        {/* Card */}
        <Suspense
          fallback={
            <div className="bg-bg-secondary border border-border rounded-xl p-6 shadow-2xl shadow-black/20">
              <div className="h-6 w-32 bg-bg-elevated rounded animate-pulse mx-auto mb-4" />
              <div className="h-4 w-48 bg-bg-elevated rounded animate-pulse mx-auto mb-6" />
              <div className="space-y-4">
                <div className="h-10 bg-bg-elevated rounded-lg animate-pulse" />
                <div className="h-10 bg-bg-elevated rounded-lg animate-pulse" />
                <div className="h-10 bg-bg-elevated rounded-lg animate-pulse" />
              </div>
            </div>
          }
        >
          <SignInForm />
        </Suspense>
      </div>
    </div>
  )
}
