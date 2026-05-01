import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

let loaderPromise = null;

function getGoogle() {
  if (!loaderPromise) {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
      version: 'weekly',
    });
    loaderPromise = loader.load();
  }
  return loaderPromise;
}

export default function StreetView({ site }) {
  const containerRef = useRef(null);
  const panoramaRef = useRef(null);

  useEffect(() => {
    if (!site.lat || !site.lng) return;
    getGoogle().then(google => {
      if (!containerRef.current) return;
      if (!panoramaRef.current) {
        panoramaRef.current = new google.maps.StreetViewPanorama(containerRef.current, {
          position: { lat: site.lat, lng: site.lng },
          pov: { heading: 0, pitch: 0 },
          zoom: 1,
          addressControl: false,
          fullscreenControl: false,
          motionTracking: false,
          motionTrackingControl: false,
        });
        new google.maps.Marker({
          position: { lat: site.lat, lng: site.lng },
          map: panoramaRef.current,
        });
      } else {
        panoramaRef.current.setPosition({ lat: site.lat, lng: site.lng });
      }
    });
  }, [site.lat, site.lng]);

  if (!site.lat || !site.lng) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F3F4F6',
        color: '#9CA3AF',
        fontSize: '13px',
      }}>
        No coordinates — run geocode script first
      </div>
    );
  }

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
