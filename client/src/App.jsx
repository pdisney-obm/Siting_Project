import { useState, useEffect } from 'react';
import PasswordGate from './components/PasswordGate';
import Map from './components/Map';
import ReviewPanel from './components/ReviewPanel';
import SiteRadarChart from './components/SiteRadarChart';
import CitySwitcher from './components/CitySwitcher';
import RankedSiteList from './components/RankedSiteList';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [sites, setSites] = useState([]);
  const [decisions, setDecisions] = useState({});
  const [selectedSite, setSelectedSite] = useState(null);
  const [activeCity, setActiveCity] = useState('atlanta');

  const citySites = sites.filter(s => s.city === activeCity);

  useEffect(() => {
    if (!token) return;
    fetch('/api/sites', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setSites(data));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch('/api/decisions', { headers: { Authorization: `Bearer ${token}` } })
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

  const handleCityChange = (city) => {
    setActiveCity(city);
    setSelectedSite(null);
  };

  if (!token) return <PasswordGate onAuth={handleAuth} />;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left sidebar */}
      <div style={{
        width: '240px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        borderRight: '1px solid #E5E7EB',
        zIndex: 20,
        height: '100vh',
      }}>
        <CitySwitcher activeCity={activeCity} onCityChange={handleCityChange} />
        <RankedSiteList
          citySites={citySites}
          decisions={decisions}
          selectedSite={selectedSite}
          onSelectSite={setSelectedSite}
        />
      </div>

      {/* Map area */}
      <div style={{ flex: 1, position: 'relative', minWidth: 0, height: '100vh' }}>
        <Map
          sites={citySites}
          decisions={decisions}
          selectedSite={selectedSite}
          onSelectSite={setSelectedSite}
          activeCity={activeCity}
        />
        {selectedSite && citySites.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '16px',
            transform: 'translateY(-50%)',
            zIndex: 10,
          }}>
            <SiteRadarChart site={selectedSite} sites={citySites} activeCity={activeCity} />
          </div>
        )}
      </div>

      {/* Review panel */}
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
