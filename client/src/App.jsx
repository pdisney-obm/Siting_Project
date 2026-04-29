import { useState, useEffect } from 'react';
import PasswordGate from './components/PasswordGate';
import Map from './components/Map';
import ReviewPanel from './components/ReviewPanel';
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [sites, setSites] = useState([]);
  const [decisions, setDecisions] = useState({});
  const [selectedSite, setSelectedSite] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch('/api/sites', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setSites(data));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch('/api/decisions', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem('auth_token');
          setToken(null);
          return null;
        }
        return res.json();
      })
      .then(data => { if (data) setDecisions(data); });
  }, [token]);

  const handleAuth = (newToken) => {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
  };

  const handleDecision = (siteId, decision) => {
    setDecisions(prev => ({ ...prev, [siteId]: decision }));
  };

  if (!token) return <PasswordGate onAuth={handleAuth} />;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div style={{ flex: 1, position: 'relative', minWidth: 0, height: '100vh' }}>
        <Map
          sites={sites}
          decisions={decisions}
          selectedSite={selectedSite}
          onSelectSite={setSelectedSite}
        />
      </div>
      {selectedSite && (
        <ReviewPanel
          site={selectedSite}
          decisions={decisions}
          onDecision={handleDecision}
          onClose={() => setSelectedSite(null)}
          token={token}
        />
      )}
    </div>
  );
}
