import { computeScore } from '../utils/score.js';

const AC_BADGE = {
  Green:  { background: '#DCFCE7', color: '#166534' },
  Yellow: { background: '#FEF9C3', color: '#854D0E' },
  Red:    { background: '#FEE2E2', color: '#991B1B' },
};

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '2px' }}>
        {label}
      </div>
      <div style={{ fontSize: '13px', color: '#111827' }}>
        {value ?? <span style={{ color: '#D1D5DB' }}>—</span>}
      </div>
    </div>
  );
}

export default function MetadataCard({ site }) {
  const score = computeScore(site);
  const acStyle = AC_BADGE[site.alcoholCompliance] || {};

  const acBadge = (
    <span style={{
      display: 'inline-block',
      padding: '1px 8px',
      borderRadius: '10px',
      fontSize: '12px',
      fontWeight: 600,
      ...acStyle,
    }}>
      {site.alcoholCompliance}
    </span>
  );

  const fields = [
    ['Site ID',                  site.siteId],
    ['Site Type',                site.siteType],
    ['Intersection',             site.intersection],
    ['Approved Alternate Corner',site.approvedAlternateCorner],
    ['Primary AADT',             site.primaryAADT?.toLocaleString()],
    ['AADT Rating',              site.aadtRating],
    ['Alcohol Compliance',       acBadge],
    ['AC Rating',                site.acRating],
    ['Downstream / Upstream',    site.downstreamUpstream],
    ['Position Rating (D/U)',    site.positionRatingDU],
    ['LH / RH Read',             site.lhRhRead],
    ['LH/RH Rating',             site.ratingLHRH],
    ['Corner / Mid-Block',       site.cornerMidBlock],
    ['Position Rating (Corner)', site.positionRatingCorner],
    ['Traffic',                  site.traffic],
    ['Traffic Rating',           site.trafficRating],
    ['Obstructions',             site.obstructions],
    ['Obstruction Rating',       site.obstructionRating],
    ['Pedestrian Rating',        site.pedestrianRating],
  ];

  return (
    <div style={{ padding: '16px' }}>
      {/* Score banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#F0F9FF',
        border: '1px solid #BAE6FD',
        borderRadius: '8px',
        padding: '10px 16px',
        marginBottom: '16px',
      }}>
        <span style={{ fontSize: '11px', color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
          Score
        </span>
        <span style={{ fontSize: '30px', fontWeight: 700, color: '#0369A1', lineHeight: 1 }}>
          {score}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
        {fields.map(([label, value]) => (
          <Field key={label} label={label} value={value} />
        ))}
      </div>
      {site.comments && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F3F4F6' }}>
          <div style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '4px' }}>
            Comments
          </div>
          <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>
            {site.comments}
          </div>
        </div>
      )}
    </div>
  );
}
