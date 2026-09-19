"use client"
import Link from 'next/link'
import { Button } from './ui/Button'
export function Navbar() {
  const [user] = useState<any>(null)

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--background)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo-horizontal-dark.svg" alt="notes2cards" className="h-7 w-auto" />
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/app">
                <Button variant="secondary" size="sm">Dashboard</Button>
              </Link>
              <button 
                onClick={handleSignOut}
                className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-4 py-1.5 rounded-full border border-white/30 text-sm font-semibold text-white hover:bg-white hover:text-black transition-all duration-200"
              >
                Log in
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
