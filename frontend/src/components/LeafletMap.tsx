import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

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

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  pinLabel: string;
  selected?: boolean;
}

// Teardrop cluster icon — teal with white count number
function clusterIcon(count: number) {
  const label = count > 999 ? "999+" : String(count);
  const fontSize = count > 99 ? 10 : 12;
  return L.divIcon({
    html: `<div style="width:38px;height:46px;position:relative;cursor:pointer;">
      <svg viewBox="0 0 38 46" width="38" height="46" xmlns="http://www.w3.org/2000/svg">
        <circle cx="19" cy="17" r="17" fill="#16A34A"/>
        <polygon points="9,28 29,28 19,46" fill="#16A34A"/>
        <text x="19" y="22" text-anchor="middle" fill="#fff" font-size="${fontSize}" font-weight="700" font-family="-apple-system,BlinkMacSystemFont,sans-serif">${label}</text>
      </svg>
    </div>`,
    className: "",
    iconSize: [38, 46],
    iconAnchor: [19, 46],
  });
}

// Price pill for individual unclustered pin
function priceIcon(label: string, selected: boolean) {
  const bg = selected ? "#16A34A" : "#fff";
  const color = selected ? "#fff" : "#0A0A0A";
  const border = selected ? "2px solid #15803D" : "1.5px solid #16A34A";
  const shadow = selected ? "0 2px 8px rgba(22,163,74,.5)" : "0 1px 4px rgba(0,0,0,.2)";
  return L.divIcon({
    html: `<div style="transform:translate(-50%,-50%);display:inline-block;background:${bg};color:${color};border:${border};border-radius:999px;padding:3px 8px;font-size:10px;font-weight:700;white-space:nowrap;box-shadow:${shadow};font-family:-apple-system,BlinkMacSystemFont,sans-serif;line-height:1.4;cursor:pointer;">SAR ${label}</div>`,
    className: "",
    iconAnchor: [0, 0],
    iconSize: [0, 0],
  });
}

interface Props {
  city: string;
  mapSat?: boolean;
  selectedId?: string;
  pins: MapPin[];
  onSelectPin: (id: string) => void;
  searchPin?: { lat: string; lng: string; radius: number; label?: string } | null;
  pinMode?: boolean;
  onPinDrop?: (lat: number, lng: number) => void;
}

export function LeafletMap({ city, mapSat, selectedId, pins, onSelectPin, searchPin, pinMode, onPinDrop }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const tileRef = useRef<L.TileLayer | null>(null);
  const searchMarkerRef = useRef<L.Marker | null>(null);
  const searchCircleRef = useRef<L.Circle | null>(null);

  // listen for zoom events from the +/− buttons in MapView
  useEffect(() => {
    const handler = (e: Event) => {
      if (mapRef.current) {
        const delta = (e as CustomEvent<number>).detail;
        mapRef.current.setZoom(mapRef.current.getZoom() + delta);
      }
    };
    window.addEventListener("ps-zoom", handler);
    return () => window.removeEventListener("ps-zoom", handler);
  }, []);

  // init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const center = CITY_CENTERS[city] || [24.7136, 46.6753];
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      preferCanvas: false,
    }).setView(center, 12);

    tileRef.current = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { maxZoom: 19 }
    ).addTo(map);

    const cluster = L.markerClusterGroup({
      maxClusterRadius: 55,
      iconCreateFunction: (c) => clusterIcon(c.getChildCount()),
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      animate: true,
      disableClusteringAtZoom: 16,
    });
    map.addLayer(cluster);
    clusterRef.current = cluster;
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
      markersRef.current.clear();
      tileRef.current = null;
      searchMarkerRef.current = null;
      searchCircleRef.current = null;
    };
  }, []);

  // recenter when city changes
  useEffect(() => {
    if (!mapRef.current) return;
    const center = CITY_CENTERS[city] || [24.7136, 46.6753];
    mapRef.current.setView(center, 12, { animate: true });
  }, [city]);

  // swap tile layer on satellite toggle
  useEffect(() => {
    if (!mapRef.current) return;
    const url = mapSat
      ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    tileRef.current?.remove();
    tileRef.current = L.tileLayer(url, { maxZoom: 19 }).addTo(mapRef.current);
  }, [mapSat]);

  // rebuild cluster when pins change
  useEffect(() => {
    const cluster = clusterRef.current;
    const map = mapRef.current;
    if (!cluster || !map) return;

    const existing = markersRef.current;
    const currentIds = new Set(pins.map((p) => p.id));

    // remove stale markers from cluster + map
    existing.forEach((m, id) => {
      if (!currentIds.has(id)) {
        cluster.removeLayer(m);
        existing.delete(id);
      }
    });

    // cap at 3000 for performance — cluster makes this look fine
    const visible = pins.slice(0, 3000);
    const toAdd: L.Marker[] = [];

    visible.forEach((p) => {
      const sel = p.id === selectedId;
      if (existing.has(p.id)) {
        existing.get(p.id)!.setIcon(priceIcon(p.pinLabel, sel));
      } else {
        const marker = L.marker([p.lat, p.lng], {
          icon: priceIcon(p.pinLabel, sel),
          riseOnHover: true,
        }).on("click", () => onSelectPin(p.id));
        existing.set(p.id, marker);
        toAdd.push(marker);
      }
    });

    if (toAdd.length > 0) cluster.addLayers(toAdd);
  }, [pins, selectedId]);

  // Pin-drop mode: crosshair cursor + forward Leaflet clicks to onPinDrop
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.getContainer().style.cursor = pinMode ? "crosshair" : "";
    if (!pinMode || !onPinDrop) return;
    const handler = (e: L.LeafletMouseEvent) => onPinDrop(e.latlng.lat, e.latlng.lng);
    map.on("click", handler);
    return () => { map.off("click", handler); map.getContainer().style.cursor = ""; };
  }, [pinMode, onPinDrop]);

  // Search pin: Leaflet marker anchored to lat/lng + dashed radius circle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    searchMarkerRef.current?.remove(); searchMarkerRef.current = null;
    searchCircleRef.current?.remove(); searchCircleRef.current = null;
    if (!searchPin) return;
    const lat = parseFloat(searchPin.lat), lng = parseFloat(searchPin.lng);
    if (isNaN(lat) || isNaN(lng)) return;
    const labelHtml = searchPin.label
      ? `<div style="position:absolute;top:-26px;left:50%;transform:translateX(-50%);white-space:nowrap;background:#16A34A;color:#fff;border-radius:999px;padding:2px 8px;font-size:11px;font-weight:600;">${searchPin.label}</div>`
      : "";
    const icon = L.divIcon({
      html: `<div style="position:relative">${labelHtml}<div style="transform:translate(-50%,-100%)"><svg width="30" height="30" viewBox="0 0 24 24" fill="#16A34A" stroke="#fff" strokeWidth="1.6"><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9.5" r="2.5" fill="#fff" stroke="none"/></svg></div></div>`,
      className: "",
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
    searchMarkerRef.current = L.marker([lat, lng], { icon, zIndexOffset: 1000, interactive: false }).addTo(map);
    if (searchPin.radius < 100) {
      searchCircleRef.current = L.circle([lat, lng], {
        radius: searchPin.radius * 1000,
        color: "#16A34A",
        fillColor: "#16A34A",
        fillOpacity: 0.08,
        weight: 2,
        dashArray: "6 4",
      }).addTo(map);
      map.fitBounds(searchCircleRef.current.getBounds(), { padding: [30, 30] });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchPin?.lat, searchPin?.lng, searchPin?.radius, searchPin?.label]);

  return <div ref={containerRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />;
}
