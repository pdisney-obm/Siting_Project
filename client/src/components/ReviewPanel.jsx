import { useState } from 'react';
import StreetView from './StreetView';
import MetadataCard from './MetadataCard';
import DecisionButtons from './DecisionButtons';

const MIN_WIDTH = 340;
const MAX_WIDTH = 960;
const DEFAULT_WIDTH = 420;

export default function ReviewPanel({ site, decisions, onDecision, onClose, token }) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [handleHovered, setHandleHovered] = useState(false);

  const onDragStart = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;

    const onMove = (e) => {
      const delta = startX - e.clientX;
      setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta)));
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: `${width}px`,
      height: '100vh',
      background: 'white',
      borderLeft: '1px solid #E5E7EB',
      flexShrink: 0,
      position: 'relative',
    }}>
      {/* Resize handle */}
      <div
        onMouseDown={onDragStart}
        onMouseEnter={() => setHandleHovered(true)}
        onMouseLeave={() => setHandleHovered(false)}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '5px',
          cursor: 'col-resize',
          zIndex: 20,
          background: handleHovered ? 'rgba(99,102,241,0.35)' : 'transparent',
          transition: 'background 0.15s',
        }}
      />

      <button
        onClick={onClose}
        title="Close"
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          zIndex: 10,
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(0,0,0,0.45)',
          color: 'white',
          fontSize: '16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ×
      </button>

      <div style={{ height: '55%', flexShrink: 0 }}>
        <StreetView site={site} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid #F3F4F6' }}>
        <MetadataCard site={site} />
      </div>

      <div style={{ flexShrink: 0, borderTop: '1px solid #E5E7EB', background: '#FAFAFA' }}>
        <DecisionButtons
          site={site}
          decisions={decisions}
          onDecision={onDecision}
          token={token}
        />
      </div>
    </div>
  );
}
