import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { CITY_CONFIG } from '../config/cities.js';

const COLORS = {
  yes:       '#22C55E',
  no:        '#EF4444',
  inventory: '#EAB308',
};

const NONE_COLOR = {
  streets:   '#9CA3AF',
  satellite: '#FFFFFF',
  traffic:   '#FFFFFF',
};

// Dark stroke on traffic so markers pop against the light navigation-day background;
// white stroke on streets/satellite where the map is darker or more colorful
const MARKER_STROKE = {
  streets:   '#ffffff',
  satellite: '#ffffff',
  traffic:   '#1F2937',
};

const MAP_STYLES = {
  streets:   { label: 'Streets',   url: 'mapbox://styles/mapbox/streets-v12' },
  satellite: { label: 'Satellite', url: 'mapbox://styles/mapbox/satellite-streets-v12' },
  traffic:   { label: 'Traffic',   url: 'mapbox://styles/mapbox/navigation-day-v1' },
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

function addSiteLayers(map, sitesRef, decisionsRef, isTraffic, noneColor, markerStroke) {
  // Traffic overlay goes beneath site markers
  if (isTraffic) {
    map.addSource('mapbox-traffic', {
      type: 'vector',
      url: 'mapbox://mapbox.mapbox-traffic-v1',
    });
    map.addLayer({
      id: 'traffic-layer',
      type: 'line',
      source: 'mapbox-traffic',
      'source-layer': 'traffic',
      paint: {
        'line-width': 2.5,
        'line-color': [
          'match', ['get', 'congestion'],
          'low',      '#4CAF50',
          'moderate', '#FFC107',
          'heavy',    '#FF9800',
          'severe',   '#F44336',
          '#9E9E9E',
        ],
      },
    });
  }

  map.addSource('sites', {
    type: 'geojson',
    data: buildGeoJSON(sitesRef.current, decisionsRef.current),
  });

  map.addLayer({
    id: 'sites-halo',
    type: 'circle',
    source: 'sites',
    paint: {
      'circle-radius': 16,
      'circle-color': '#1D4ED8',
      'circle-opacity': ['case', ['boolean', ['get', 'selected'], false], 0.18, 0],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#1D4ED8',
      'circle-stroke-opacity': ['case', ['boolean', ['get', 'selected'], false], 0.45, 0],
    },
  });

  map.addLayer({
    id: 'sites-circle',
    type: 'circle',
    source: 'sites',
    paint: {
      'circle-radius': ['case', ['boolean', ['get', 'selected'], false], 9, 7],
      'circle-color': [
        'match', ['get', 'decision'],
        'yes',       COLORS.yes,
        'no',        COLORS.no,
        'inventory', COLORS.inventory,
        noneColor,
      ],
      'circle-stroke-width': ['case', ['boolean', ['get', 'selected'], false], 3, 2],
      'circle-stroke-color': ['case', ['boolean', ['get', 'selected'], false], '#1D4ED8', markerStroke],
      'circle-opacity': 1,
    },
  });
}

export default function Map({ sites, decisions, selectedSite, onSelectSite, activeCity }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const sitesRef = useRef(sites);
  const decisionsRef = useRef(decisions);
  const [mapStyle, setMapStyle] = useState('streets');
  const mapStyleRef = useRef('streets');

  useEffect(() => { sitesRef.current = sites; }, [sites]);
  useEffect(() => { decisionsRef.current = decisions; }, [decisions]);

  useEffect(() => {
    if (mapRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLES.streets.url,
      center: [-84.388, 33.749],
      zoom: 11,
      minZoom: 4,
      maxBounds: [[-125, 24], [-66, 50]],
    });
    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    // Click/cursor handlers — added once, persist through setStyle() calls
    map.on('click', 'sites-circle', (e) => {
      const siteId = e.features[0].properties.siteId;
      const site = sitesRef.current.find(s => s.siteId === siteId);
      if (site) onSelectSite(site);
    });
    map.on('mouseenter', 'sites-circle', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'sites-circle', () => { map.getCanvas().style.cursor = ''; });

    // Re-add all sources and layers after every style load (initial load + setStyle)
    map.on('style.load', () => {
      const style = mapStyleRef.current;
      addSiteLayers(map, sitesRef, decisionsRef, style === 'traffic', NONE_COLOR[style], MARKER_STROKE[style]);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild GeoJSON when sites, decisions, or selected site changes
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

  // Fly to city center when city changes
  useEffect(() => {
    if (!mapRef.current || !activeCity) return;
    const { center, zoom } = CITY_CONFIG[activeCity];
    mapRef.current.flyTo({ center, zoom, duration: 1500 });
  }, [activeCity]);

  const handleStyleChange = (style) => {
    if (style === mapStyleRef.current) return;
    setMapStyle(style);
    mapStyleRef.current = style;
    mapRef.current?.setStyle(MAP_STYLES[style].url);
  };

  const handleNext = () => {
    const unreviewed = sites
      .filter(s => s.lat && s.lng && !decisionsRef.current[s.siteId])
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

      {/* Logo */}
      <img
        src="/logo-horizontal.png"
        alt="IKE Smart City"
        style={{
          position: 'absolute',
          bottom: '28px',
          left: '12px',
          height: '28px',
          opacity: 0.85,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      {/* Style toggle — sits above the logo */}
      <div style={{
        position: 'absolute',
        bottom: '64px',
        left: '12px',
        zIndex: 10,
        display: 'flex',
        background: '#ffffff',
        borderRadius: '6px',
        boxShadow: '0 1px 6px rgba(0,0,0,0.22)',
        overflow: 'hidden',
      }}>
        {Object.entries(MAP_STYLES).map(([key, { label }]) => {
          const active = mapStyle === key;
          return (
            <button
              key={key}
              onClick={() => handleStyleChange(key)}
              style={{
                padding: '6px 10px',
                fontSize: '11px',
                fontWeight: 600,
                border: 'none',
                borderRight: key !== 'traffic' ? '1px solid #E5E7EB' : 'none',
                background: active ? '#1D4ED8' : 'transparent',
                color: active ? '#ffffff' : '#374151',
                cursor: 'pointer',
                letterSpacing: '0.02em',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Next Unreviewed button */}
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
