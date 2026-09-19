import React from 'react';
import { Handle, Position } from '@xyflow/react';
import '../canvas/FlowStyles.css';

interface ProcessingNodeData {
  label?: string;
}

export function ProcessingNode({ data }: { data: ProcessingNodeData }) {
  return (
    <div className="glass-node-wrapper">
      {/* Left handle to connect from Input */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="custom-handle" 
      />
      
      <div className="glass-node-frosted">
        <div className="glass-node-inner">
          <div className="node-header-title">{data.label || 'Processing'}</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Options */}
            <div>
              <div style={{ fontSize: '0.65rem', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>Options</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#10b981', cursor: 'pointer' }} />
                <span className="node-body-text">Extract Definitions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <input type="checkbox" style={{ accentColor: '#10b981', cursor: 'pointer' }} />
                <span className="node-body-text">Generate Equations</span>
              </div>
            </div>

            {/* Depth Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.65rem', color: '#666', textTransform: 'uppercase' }}>Depth Level</span>
                <span style={{ fontSize: '0.65rem', color: '#888' }}>Standard</span>
              </div>
              <input type="range" min="1" max="5" defaultValue="3" style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }} />
            </div>

            {/* Run Button placeholder */}
            <button style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              color: '#fff', 
              padding: '10px', 
              borderRadius: '8px', 
              fontFamily: 'inherit',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem',
              letterSpacing: '0.05em'
            }}>
              RUN PROCESS
            </button>
          </div>
        </div>
      </div>
      
      {/* Right handle to connect to Output */}
      <Handle 
        type="source" 
        position={Position.Right} 
        className="custom-handle" 
      />
    </div>
  );
}
