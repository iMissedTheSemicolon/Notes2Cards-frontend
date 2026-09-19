interface ProgressBarProps {
  progress: number
  statusText: string
  isError?: boolean
}

export function ProgressBar({ progress, statusText, isError }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className={isError ? "text-[var(--error)]" : "text-[var(--primary)]"}>{statusText}</span>
        <span className="text-[var(--muted)]">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-[#1a1a24] rounded-full h-2 overflow-hidden">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${isError ? 'bg-[var(--error)]' : 'bg-[var(--primary)]'}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  )
}
