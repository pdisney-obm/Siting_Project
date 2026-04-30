import { CITY_CONFIG } from '../config/cities.js';

export default function CitySwitcher({ activeCity, onCityChange }) {
  return (
    <div style={{
      padding: '12px',
      borderBottom: '1px solid #E5E7EB',
    }}>
      <div style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: '6px' }}>
        City
      </div>
      <select
        value={activeCity}
        onChange={e => onCityChange(e.target.value)}
        style={{
          width: '100%',
          padding: '6px 8px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#111827',
          background: '#F9FAFB',
          border: '1px solid #D1D5DB',
          borderRadius: '6px',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        {Object.entries(CITY_CONFIG).map(([key, cfg]) => (
          <option key={key} value={key}>{cfg.name}</option>
        ))}
      </select>
    </div>
  );
}
