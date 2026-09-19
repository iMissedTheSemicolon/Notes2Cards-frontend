import { Button } from './ui/Button'
import Link from 'next/link'

export function PricingCard() {
  const checkoutUrl = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL || "#"

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 max-w-sm mx-auto shadow-xl flex flex-col">
      <div className="mb-8">
        <span className="bg-[var(--primary)]/20 text-[var(--primary)] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Lifetime Access</span>
        <h3 className="text-4xl font-display font-bold mt-4 mb-2">$8</h3>
        <p className="text-[var(--muted)]">Pay once, use forever.</p>
      </div>
      
      <ul className="space-y-4 mb-8 flex-1">
        <li className="flex items-start gap-3">
          <svg className="w-5 h-5 text-[var(--success)] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          <span className="text-sm text-[var(--foreground)]">Unlimited PDF processing</span>
        </li>
        <li className="flex items-start gap-3">
          <svg className="w-5 h-5 text-[var(--success)] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          <span className="text-sm text-[var(--foreground)]">Direct Anki .apkg export</span>
        </li>
        <li className="flex items-start gap-3">
          <svg className="w-5 h-5 text-[var(--success)] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          <span className="text-sm text-[var(--foreground)]">Custom prompt support</span>
        </li>
        <li className="flex items-start gap-3">
          <svg className="w-5 h-5 text-[var(--success)] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          <span className="text-sm text-[var(--foreground)]">Process handwritten scans</span>
        </li>
      </ul>

      <Link href={checkoutUrl} className="w-full">
        <Button className="w-full" size="lg">Get Lifetime Access</Button>
      </Link>
      <p className="text-center text-xs text-[var(--muted)] mt-4">Secure payment via Lemon Squeezy</p>
    </div>
  )
}
