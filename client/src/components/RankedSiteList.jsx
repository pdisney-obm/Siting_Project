import { computeScore } from '../utils/score.js';

const DECISION_COLORS = {
  yes:       '#22C55E',
  no:        '#EF4444',
  inventory: '#EAB308',
  none:      '#D1D5DB',
};

function DecisionDot({ decision }) {
  return (
    <span style={{
      display: 'inline-block',
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      background: DECISION_COLORS[decision] ?? DECISION_COLORS.none,
      flexShrink: 0,
    }} />
  );
}

export default function RankedSiteList({ citySites, decisions, selectedSite, onSelectSite }) {
  const ranked = [...citySites].sort((a, b) => computeScore(b) - computeScore(a));

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      minHeight: 0,
    }}>
      <div style={{ padding: '8px 12px 4px', fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
        Sites by Score
      </div>
      {ranked.map((site, index) => {
        const isSelected = selectedSite?.siteId === site.siteId;
        const decision = decisions[site.siteId] ?? 'none';
        return (
          <div
            key={site.siteId}
            onClick={() => onSelectSite(site)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderBottom: '1px solid #F3F4F6',
              background: isSelected ? '#EFF6FF' : 'transparent',
              cursor: 'pointer',
              borderLeft: isSelected ? '3px solid #2563EB' : '3px solid transparent',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', width: '18px', flexShrink: 0 }}>
              {index + 1}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>
                {site.siteId}
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {site.intersection}
              </div>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB', flexShrink: 0 }}>
              {computeScore(site)}
            </span>
            <DecisionDot decision={decision} />
          </div>
        );
      })}
    </div>
  );
}
