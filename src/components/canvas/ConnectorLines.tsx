// components/canvas/ConnectorLines.tsx

import { useEffect, useRef, useState } from 'react';

interface ConnectorLinesProps {
  // Pass in the DOM elements of the RIGHT connection point of source
  // and LEFT connection point of destination
  sourceEl: HTMLDivElement | null;
  destEl: HTMLDivElement | null;
  status: 'idle' | 'active' | 'complete';
  // Canvas element for offset calculation
  canvasEl: HTMLDivElement | null;
}

function getCenter(el: HTMLDivElement, canvas: HTMLDivElement) {
  const elRect = el.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  return {
    x: elRect.left + elRect.width / 2 - canvasRect.left,
    y: elRect.top  + elRect.height / 2 - canvasRect.top,
  };
}

export function ConnectorLine({ sourceEl, destEl, status, canvasEl }: ConnectorLinesProps) {
  const [path, setPath] = useState('');
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      if (!sourceEl || !destEl || !canvasEl) return;
      const s = getCenter(sourceEl, canvasEl);
      const d = getCenter(destEl, canvasEl);
      const dx = Math.abs(d.x - s.x) * 0.5;
      // Cubic bezier: control points pulled horizontally
      setPath(`M ${s.x} ${s.y} C ${s.x + dx} ${s.y}, ${d.x - dx} ${d.y}, ${d.x} ${d.y}`);
      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [sourceEl, destEl, canvasEl]);

  const strokeColor = status === 'complete'
    ? '#00FF88'
    : status === 'active'
    ? 'rgba(255,255,255,0.45)'
    : 'rgba(255,255,255,0.18)';

  const glowColor = status === 'complete'
    ? 'rgba(0,255,136,0.6)'
    : 'rgba(255,255,255,0.3)';

  const filterId = `glow-${Math.random().toString(36).slice(2)}`;

  if (!path) return null;

  return (
    <g>
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Glow layer — blurred duplicate of the path */}
      <path
        d={path}
        stroke={glowColor}
        strokeWidth={4}
        fill="none"
        filter={`url(#${filterId})`}
        style={{
          opacity: status === 'active' || status === 'complete' ? 1 : 0,
          transition: 'opacity 0.5s ease, stroke 0.5s ease',
        }}
      />

      {/* Main line */}
      <path
        d={path}
        stroke={strokeColor}
        strokeWidth={1.5}
        fill="none"
        strokeDasharray={status === 'active' ? '0' : '6 4'}
        style={{
          transition: 'stroke 0.5s ease',
          strokeDashoffset: status === 'active' ? undefined : 0,
        }}
      />

      {/* Animated flow dots when active — small circles travelling along the path */}
      {status === 'active' && (
        <>
          <circle r="3" fill="#ffffff" filter={`url(#${filterId})`}>
            <animateMotion dur="2s" repeatCount="indefinite" path={path} />
          </circle>
          <circle r="3" fill="#ffffff" filter={`url(#${filterId})`}>
            <animateMotion dur="2s" begin="1s" repeatCount="indefinite" path={path} />
          </circle>
        </>
      )}

      {/* Arrowhead at destination */}
      <circle
        cx={getCenter(destEl!, canvasEl!).x}
        cy={getCenter(destEl!, canvasEl!).y}
        r="4"
        fill={strokeColor}
        style={{ transition: 'fill 0.5s ease' }}
      />
    </g>
  );
}
