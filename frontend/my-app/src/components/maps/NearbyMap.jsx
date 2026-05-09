import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultCenter = [34.0837, 74.7973]; // Srinagar-ish

// Fix default marker icon paths for Vite
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function FocusMarker({ pharmacy }) {
  const map = useMap();
  useEffect(() => {
    if (!pharmacy) return;
    map.flyTo([pharmacy.latitude, pharmacy.longitude], 14, { duration: 0.7 });
  }, [pharmacy, map]);
  return null;
}

export function NearbyMap({ pharmacies, focusPharmacyId }) {
  const containerRef = useRef(null);

  const focusPharmacy = useMemo(
    () => pharmacies.find((p) => p._id === focusPharmacyId),
    [pharmacies, focusPharmacyId],
  );

  return (
    <div ref={containerRef} className="h-[420px] w-full overflow-hidden rounded-2xl border border-base-300">
      <MapContainer center={defaultCenter} zoom={12} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FocusMarker pharmacy={focusPharmacy} />

        {pharmacies.map((p) => (
          <Marker key={p._id} position={[p.latitude, p.longitude]}>
            <Popup>
              <div className="space-y-1">
                <div className="font-semibold">{p.pharmacyName}</div>
                <div className="text-sm opacity-80">{p.address}</div>
                <a href={p.googleMapsUrl} target="_blank" rel="noreferrer">
                  Open in Google Maps
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

