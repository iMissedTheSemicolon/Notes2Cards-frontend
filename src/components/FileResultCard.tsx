import { Button } from './ui/Button'

interface FileResultCardProps {
  fileName: string
  status: 'success' | 'error'
  cardCount?: number
  error?: string
  onDownloadApkg?: () => void
  onDownloadTxt?: () => void
}

export function FileResultCard({ fileName, status, cardCount, error, onDownloadApkg, onDownloadTxt }: FileResultCardProps) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${status === 'success' ? 'bg-[var(--success)]/20 text-[var(--success)]' : 'bg-[var(--error)]/20 text-[var(--error)]'}`}>
          {status === 'success' ? (
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          ) : (
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-[var(--foreground)] truncate sm:max-w-xs" title={fileName}>{fileName}</h4>
          {status === 'success' ? (
            <p className="text-sm text-[var(--muted)]">{cardCount} flashcards generated</p>
          ) : (
            <p className="text-sm text-[var(--error)]">{error || "Failed to process"}</p>
          )}
        </div>
      </div>
      
      {status === 'success' && (
        <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-4 sm:mt-0 justify-end">
          {onDownloadApkg && <Button size="sm" onClick={onDownloadApkg}>Download APKG</Button>}
          {onDownloadTxt && <Button variant="outline" size="sm" onClick={onDownloadTxt}>Download TXT</Button>}
        </div>
      )}
    </div>
  )
}
