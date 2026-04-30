import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { computeScore } from '../utils/score.js';

const RATING_LABELS = {
  aadtRating:           'AADT Rating',
  acRating:             'AC Rating',
  positionRatingDU:     'Position Rating (D/U)',
  ratingLHRH:           'LH/RH Rating',
  positionRatingCorner: 'Position Rating (Corner)',
  trafficRating:        'Traffic Rating',
  obstructionRating:    'Obstruction Rating',
};

function computeAverages(sites) {
  const fields = Object.keys(RATING_LABELS);
  const averages = {};
  fields.forEach(field => {
    const values = sites.map(s => s[field]).filter(v => v != null);
    averages[field] = parseFloat(
      (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
    );
  });
  return averages;
}

export default function SiteRadarChart({ site, sites }) {
  const averages = computeAverages(sites);

  const chartData = Object.keys(RATING_LABELS).map(field => ({
    category: RATING_LABELS[field],
    thisSite: site[field],
    average:  averages[field],
  }));

  const siteScore = computeScore(site);
  const avgScore = parseFloat(
    (sites.reduce((sum, s) => sum + computeScore(s), 0) / sites.length).toFixed(1)
  );

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
      padding: '12px 8px 8px',
      width: '280px',
    }}>
      <div style={{ padding: '0 8px 4px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
          {site.siteId} — Ratings
        </div>
        <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
          Compared to Atlanta average ({sites.length} sites)
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 16 }}>
          <PolarGrid />
          <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: '#6B7280' }} />
          <Tooltip
            formatter={(value, name) => [value, name === 'thisSite' ? site.siteId : 'ATL Avg']}
            contentStyle={{ fontSize: '12px', borderRadius: '6px' }}
          />
          <Radar
            name="thisSite"
            dataKey="thisSite"
            stroke="#2563EB"
            fill="#2563EB"
            fillOpacity={0.5}
          />
          <Radar
            name="average"
            dataKey="average"
            stroke="#F59E0B"
            fill="#F59E0B"
            fillOpacity={0.15}
            strokeDasharray="4 4"
          />
          <Legend
            formatter={(value) => value === 'thisSite' ? site.siteId : 'ATL Avg'}
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
          />
        </RadarChart>
      </ResponsiveContainer>

      <div style={{
        borderTop: '1px solid #F3F4F6',
        marginTop: '4px',
        paddingTop: '8px',
        paddingLeft: '8px',
        paddingRight: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#374151',
      }}>
        <span>Score: <strong style={{ color: '#2563EB' }}>{siteScore}</strong></span>
        <span>Avg: <strong style={{ color: '#B45309' }}>{avgScore}</strong></span>
      </div>
    </div>
  );
}
