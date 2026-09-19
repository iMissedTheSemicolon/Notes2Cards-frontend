"use client"

import { useState, useEffect } from 'react'
import { ArrowLeft, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateAndDownloadApkg } from '@/lib/ankiExport.client'

interface HistoryItem {
  id: string;
  fileName: string;
  baseName: string;
  cardCount: number;
  cardType: 'standard' | 'cloze';
  timestamp: number;
  cards: any[];
}

function groupByDate(items: HistoryItem[]): { label: string; items: HistoryItem[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;

  const groups: Record<string, HistoryItem[]> = {};

  for (const item of items) {
    const itemDate = new Date(item.timestamp);
    const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate()).getTime();

    let label: string;
    if (itemDay >= today) label = 'Today';
    else if (itemDay >= yesterday) label = 'Yesterday';
    else label = itemDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }

  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

export function HistoryPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      try {
        const raw = localStorage.getItem('generation_history');
        if (raw) setHistory(JSON.parse(raw));
        else setHistory([]);
      } catch {
        setHistory([]);
      }
    }
  }, [isOpen]);

  const handleRedownload = (item: HistoryItem) => {
    generateAndDownloadApkg(item.baseName, item.cards, item.cardType);
  };

  const handleClearHistory = () => {
    try {
      localStorage.removeItem('generation_history');
    } catch {}
    setHistory([]);
  };

  const grouped = groupByDate(history);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'fixed',
            left: 56,
            top: 0,
            bottom: 0,
            width: 280,
            background: 'rgba(13, 13, 13, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.06)',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'var(--font-outfit), Outfit, sans-serif',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 16px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', display: 'flex', padding: 4,
                }}
              >
                <ArrowLeft size={18} />
              </button>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>History</span>
            </div>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  fontSize: 11,
                  padding: '4px 8px',
                  borderRadius: 6,
                  fontFamily: 'inherit',
                  transition: 'color 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#FF5DE7';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,93,231,0.3)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 12px',
            }}
            className="custom-scrollbar"
          >
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13, marginTop: 40 }}>
                No generations yet.
                <br />
                <span style={{ fontSize: 11 }}>Your history will appear here.</span>
              </div>
            ) : (
              grouped.map(group => (
                <div key={group.label} style={{ marginBottom: 16 }}>
                  <div style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.35)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 600,
                    marginBottom: 8,
                    paddingLeft: 4,
                  }}>
                    {group.label}
                  </div>

                  {group.items.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 8px',
                        borderRadius: 8,
                        marginBottom: 2,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                          fontSize: 13,
                          color: '#fff',
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {item.baseName || item.fileName}
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                          {item.cardCount} cards · {item.cardType === 'cloze' ? 'Cloze' : 'Standard'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRedownload(item)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'rgba(255,255,255,0.3)',
                          cursor: 'pointer',
                          padding: 6,
                          borderRadius: 6,
                          display: 'flex',
                          flexShrink: 0,
                          transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#6DB5FF')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                        title="Re-download"
                      >
                        <Download size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
