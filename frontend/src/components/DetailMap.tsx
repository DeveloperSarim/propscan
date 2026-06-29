import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const CITY_CENTERS: Record<string, [number, number]> = {
  Riyadh: [24.7136, 46.6753],
  Jeddah: [21.4858, 39.1925],
  Mecca: [21.3891, 39.8579],
  Medina: [24.5247, 39.5692],
  Dammam: [26.4207, 50.0888],
  Khobar: [26.2172, 50.1971],
  Taif: [21.2703, 40.4158],
  Tabuk: [28.3835, 36.5662],
  Abha: [18.2164, 42.5053],
};

const PIN_ICON = L.divIcon({
  html: `<div style="transform:translate(-50%,-100%);width:26px;height:32px;">
    <svg viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 21 9 21s9-14.25 9-21c0-4.97-4.03-9-9-9z" fill="#16A34A"/>
      <circle cx="12" cy="9" r="4" fill="white"/>
    </svg>
  </div>`,
  className: "",
  iconAnchor: [0, 0],
  iconSize: [0, 0],
});

interface Props {
  lat?: number;
  lng?: number;
  city: string;
  label: string;
}

export function DetailMap({ lat, lng, city, label }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const hasCoords = lat && lng && lat !== 0 && lng !== 0;
    const center: [number, number] = hasCoords
      ? [lat!, lng!]
      : (CITY_CENTERS[city] || [24.7136, 46.6753]);
    const zoom = hasCoords ? 15 : 12;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false,
    }).setView(center, zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    if (hasCoords) {
      L.marker([lat!, lng!], { icon: PIN_ICON })
        .addTo(map)
        .bindPopup(label, { closeButton: false })
        .openPopup();
    }

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", borderRadius: "inherit" }} />
  );
}
