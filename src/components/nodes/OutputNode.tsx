import React from 'react';
import { Handle, Position } from '@xyflow/react';
import '../canvas/FlowStyles.css';

interface OutputNodeData {
  label?: string;
  status?: 'idle' | 'success' | 'error';
}

export function OutputNode({ data }: { data: OutputNodeData }) {
  return (
    <div className="glass-node-wrapper">
      {/* Left handle to connect from Processing */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="custom-handle" 
      />
      
      <div className="glass-node-frosted">
        <div className="glass-node-inner">
          <div className="node-header-title">{data.label || 'Output'}</div>
          
          <div style={{ padding: '24px 16px', textAlign: 'center' }}>
            <svg style={{ width: 24, height: 24, color: '#888', margin: '0 auto 8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            <p className="node-body-text" style={{ fontSize: '0.75rem', color: '#888' }}>
              Waiting for processed deck...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
