import StreetView from './StreetView';
import MetadataCard from './MetadataCard';
import DecisionButtons from './DecisionButtons';

export default function ReviewPanel({ site, decisions, onDecision, onClose, token }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '420px',
      height: '100vh',
      background: 'white',
      borderLeft: '1px solid #E5E7EB',
      flexShrink: 0,
      position: 'relative',
    }}>
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
          lineHeight: '1',
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
