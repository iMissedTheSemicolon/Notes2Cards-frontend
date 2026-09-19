// components/canvas/NodeBox.tsx

import { useRef, useEffect, useState } from 'react';
import { useDrag } from '@use-gesture/react';
import { motion, AnimatePresence } from 'framer-motion';

type NodeStatus = 'idle' | 'active' | 'complete' | 'error';
type NodeAccent = 'cyan' | 'yellow' | 'pink';

interface NodeBoxProps {
  title: string;
  accent: NodeAccent;          // which brand color to glow
  status: NodeStatus;
  onPositionChange?: (x: number, y: number) => void;
  children: React.ReactNode;
  defaultPosition: { x: number; y: number };
  connectionPointLeft?: boolean;
  connectionPointRight?: boolean;
  onConnectionPointRef?: (side: 'left'|'right', el: HTMLDivElement|null) => void;
}

const ACCENT_COLORS: Record<NodeAccent, string> = {
  cyan:   '#6DB5FF',
  yellow: '#FEFA3D',
  pink:   '#FF5DE7',
};

const ACCENT_GLOW: Record<NodeAccent, string> = {
  cyan:   'rgba(109, 181, 255, 0.18)',
  yellow: 'rgba(254, 250, 61,  0.18)',
  pink:   'rgba(255, 93,  231, 0.18)',
};

export function NodeBox({
  title, accent, status, onPositionChange,
  children, defaultPosition,
  connectionPointLeft, connectionPointRight,
  onConnectionPointRef,
}: NodeBoxProps) {
  const [pos, setPos] = useState(defaultPosition);
  const dragRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);

  const bind = useDrag(({ offset: [x, y] }) => {
    setPos({ x, y });
    onPositionChange?.(x, y);
  }, {
    from: () => [pos.x, pos.y],
  });

  const accentColor = status === 'complete'
    ? '#00FF88'
    : ACCENT_COLORS[accent];

  const glowColor = status === 'complete'
    ? 'rgba(0, 255, 136, 0.22)'
    : ACCENT_GLOW[accent];

  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: 320,
        zIndex: status === 'active' ? 50 : 10,
      }}
    >
      {/* 
        OUTER SHELL: This is the frosted glass border layer.
        It uses a gradient border technique to create the glass effect.
      */}
      <div
        className={`node-glow-${status === 'complete' ? 'green' : accent}`}
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-node)',
          padding: '1px',             /* This 1px padding IS the glass border */
          background: `linear-gradient(
            145deg,
            rgba(255,255,255,0.10) 0%,
            rgba(255,255,255,0.04) 50%,
            rgba(255,255,255,0.08) 100%
          )`,
          boxShadow: `
            0 0 0 1px rgba(255,255,255,0.04),
            0 8px 32px rgba(0,0,0,0.6),
            0 0 40px ${glowColor},
            inset 0 1px 0 rgba(255,255,255,0.08)
          `,
          transition: 'box-shadow 0.6s ease',
        }}
      >
        {/* 
          INNER SHELL: Solid dark content area.
          This sits INSIDE the 1px glass border.
        */}
        <div
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'calc(var(--radius-node) - 1px)',
            overflow: 'hidden',
          }}
        >
          {/* DRAG HANDLE — the header bar, only this area is draggable */}
          <div
            {...bind()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.02)',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              cursor: 'grab',
            }}
          >
            {/* Status dot */}
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: accentColor,
                boxShadow: `0 0 8px ${accentColor}`,
                transition: 'background 0.4s, box-shadow 0.4s',
              }}
            />

            {/* Node title */}
            <div
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.8)',
              }}
            >
              {title}
            </div>
          </div>

          {/* NODE CONTENT */}
          <div style={{ padding: 16 }}>
            {children}
          </div>
        </div>
      </div>

      {/* LEFT CONNECTION POINT */}
      {connectionPointLeft && (
        <div
          ref={el => {
            leftRef.current = el;
            onConnectionPointRef?.('left', el);
          }}
          style={{
            position: 'absolute',
            left: -5,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: accentColor,
            border: '1.5px solid rgba(255,255,255,0.2)',
            boxShadow: `0 0 8px ${accentColor}`,
            zIndex: 10,
            transition: 'background 0.4s, box-shadow 0.4s',
          }}
        />
      )}

      {/* RIGHT CONNECTION POINT */}
      {connectionPointRight && (
        <div
          ref={el => {
            rightRef.current = el;
            onConnectionPointRef?.('right', el);
          }}
          style={{
            position: 'absolute',
            right: -5,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: accentColor,
            border: '1.5px solid rgba(255,255,255,0.2)',
            boxShadow: `0 0 8px ${accentColor}`,
            zIndex: 10,
            transition: 'background 0.4s, box-shadow 0.4s',
          }}
        />
      )}
    </div>
  );
}
