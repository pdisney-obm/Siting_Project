import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const COLORS = {
  yes:       '#22C55E',
  no:        '#EF4444',
  inventory: '#EAB308',
  none:      '#9CA3AF',
};

function buildGeoJSON(sites, decisions, selectedSiteId = null) {
  return {
    type: 'FeatureCollection',
    features: sites
      .filter(s => s.lat && s.lng)
      .map(site => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [site.lng, site.lat] },
        properties: {
          siteId: site.siteId,
          decision: decisions[site.siteId] || 'none',
          selected: site.siteId === selectedSiteId,
        },
      })),
  };
}

export default function Map({ sites, decisions, selectedSite, onSelectSite }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-84.388, 33.749],
      zoom: 11,
    });
    mapRef.current = map;

    map.on('load', () => {
      map.addSource('sites', {
        type: 'geojson',
        data: buildGeoJSON(sites, {}),
      });

      // Halo ring behind selected marker
      map.addLayer({
        id: 'sites-halo',
        type: 'circle',
        source: 'sites',
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            10, 13, 14, 18, 18, 24,
          ],
          'circle-color': '#1D4ED8',
          'circle-opacity': [
            'case', ['boolean', ['get', 'selected'], false], 0.22, 0,
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#1D4ED8',
          'circle-stroke-opacity': [
            'case', ['boolean', ['get', 'selected'], false], 0.5, 0,
          ],
        },
      });

      // Main circles
      map.addLayer({
        id: 'sites-circle',
        type: 'circle',
        source: 'sites',
        paint: {
          'circle-radius': [
            'case', ['boolean', ['get', 'selected'], false],
            ['interpolate', ['linear'], ['zoom'], 10, 7, 14, 11, 18, 15],
            ['interpolate', ['linear'], ['zoom'], 10, 5, 14,  8, 18, 12],
          ],
          'circle-color': [
            'match', ['get', 'decision'],
            'yes',       COLORS.yes,
            'no',        COLORS.no,
            'inventory', COLORS.inventory,
            COLORS.none,
          ],
          'circle-stroke-width': [
            'case', ['boolean', ['get', 'selected'], false], 3, 2,
          ],
          'circle-stroke-color': [
            'case', ['boolean', ['get', 'selected'], false], '#1D4ED8', '#ffffff',
          ],
          'circle-opacity': 1,
        },
      });

      map.on('click', 'sites-circle', (e) => {
        const siteId = e.features[0].properties.siteId;
        const site = sites.find(s => s.siteId === siteId);
        if (site) onSelectSite(site);
      });

      map.on('mouseenter', 'sites-circle', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'sites-circle', () => {
        map.getCanvas().style.cursor = '';
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild GeoJSON when decisions or selected site changes
  useEffect(() => {
    const source = mapRef.current?.getSource('sites');
    if (source) source.setData(buildGeoJSON(sites, decisions, selectedSite?.siteId ?? null));
  }, [decisions, sites, selectedSite]);

  // Fly to selected site
  useEffect(() => {
    if (selectedSite?.lat && selectedSite?.lng && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedSite.lng, selectedSite.lat],
        zoom: Math.max(mapRef.current.getZoom(), 14),
        duration: 800,
      });
    }
  }, [selectedSite]);

  const handleNext = () => {
    const unreviewed = sites
      .filter(s => s.lat && s.lng && !decisions[s.siteId])
      .sort((a, b) => a.siteId.localeCompare(b.siteId));
    if (!unreviewed.length) return;

    const currentIdx = unreviewed.findIndex(s => s.siteId === selectedSite?.siteId);
    const nextIdx = (currentIdx + 1) % unreviewed.length;
    const next = unreviewed[nextIdx];

    onSelectSite(next);
    mapRef.current?.flyTo({
      center: [next.lng, next.lat],
      zoom: Math.max(mapRef.current.getZoom(), 14),
      duration: 800,
    });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <button
        onClick={handleNext}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 10,
          padding: '8px 16px',
          background: '#1D4ED8',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 600,
          fontSize: '13px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        }}
      >
        Next Unreviewed
      </button>
    </div>
  );
}
