const BUTTONS = [
  { label: '✓ Yes',      value: 'yes',       base: '#16A34A', active: '#22C55E' },
  { label: '✗ No',       value: 'no',        base: '#DC2626', active: '#EF4444' },
  { label: '⊙ Inventory',value: 'inventory', base: '#B45309', active: '#D97706' },
];

export default function DecisionButtons({ site, decisions, onDecision, token }) {
  const current = decisions[site.siteId];

  const handleClick = async (value) => {
    await fetch(`/api/decisions/${site.siteId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ decision: value }),
    });
    onDecision(site.siteId, value);
  };

  return (
    <div style={{ display: 'flex', gap: '8px', padding: '12px 16px' }}>
      {BUTTONS.map(({ label, value, base, active }) => {
        const isActive = current === value;
        return (
          <button
            key={value}
            onClick={() => handleClick(value)}
            style={{
              flex: 1,
              padding: '10px 4px',
              borderRadius: '6px',
              border: `2px solid ${isActive ? active : base}`,
              background: isActive ? active : 'white',
              color: isActive ? 'white' : base,
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
