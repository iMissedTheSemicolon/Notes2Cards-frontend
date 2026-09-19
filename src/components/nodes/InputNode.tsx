import React from 'react';
import { Handle, Position } from '@xyflow/react';
import '../canvas/FlowStyles.css';

interface InputNodeData {
  label?: string;
  description?: string;
}

export function InputNode({ data }: { data: InputNodeData }) {
  return (
    <div className="glass-node-wrapper">
      <div className="glass-node-frosted">
        <div className="glass-node-inner">
          <div className="node-header-title">{data.label || 'Input'}</div>
          
          <div style={{ border: '1.5px dashed rgba(255,255,255,0.1)', padding: '24px 16px', borderRadius: '8px', textAlign: 'center' }}>
            <svg style={{ width: 24, height: 24, color: '#888', margin: '0 auto 8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            <p className="node-body-text" style={{ fontSize: '0.75rem', color: '#888' }}>
              {data.description || 'Drop files here'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Right handle to connect to processing */}
      <Handle 
        type="source" 
        position={Position.Right} 
        className="custom-handle" 
      />
    </div>
  );
}
