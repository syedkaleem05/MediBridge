export const DEMO_PHARMACY_LOCATIONS = [
  {
    areaLabel: "Lal Chowk",
    pharmacyName: "MediBridge Pharmacy — Lal Chowk",
    address: "Lal Chowk, Srinagar, J&K",
    latitude: 34.0691,
    longitude: 74.8050,
    phone: "+91 7000000001",
    openingHours: "9:00 AM - 10:00 PM",
  },
  {
    areaLabel: "Hazratbal",
    pharmacyName: "MediBridge Pharmacy — Hazratbal",
    address: "Hazratbal, Srinagar, J&K",
    latitude: 34.1387,
    longitude: 74.8296,
    phone: "+91 7000000002",
    openingHours: "9:30 AM - 9:30 PM",
  },
  {
    areaLabel: "Baramulla",
    pharmacyName: "MediBridge Pharmacy — Baramulla",
    address: "Baramulla, J&K",
    latitude: 34.2000,
    longitude: 74.3500,
    phone: "+91 7000000003",
    openingHours: "10:00 AM - 8:00 PM",
  },
];

export const DEMO_MEDICINES = [
  {
    barcode: "1111",
    medicineName: "Paracetamol",
    manufacturer: "MediLabs",
    category: "Pain Relief",
    description: "Common pain reliever and fever reducer.",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=60",
  },
  {
    barcode: "2222",
    medicineName: "Crocin",
    manufacturer: "GSK",
    category: "Fever",
    description: "Paracetamol brand for fever and mild pain.",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=60",
  },
  {
    barcode: "3333",
    medicineName: "Dolo 650",
    manufacturer: "Micro Labs",
    category: "Fever",
    description: "650mg paracetamol for fever/pain.",
    image: "https://images.unsplash.com/photo-1626315869436-d6781ba69d6d?auto=format&fit=crop&w=800&q=60",
  },
  {
    barcode: "4444",
    medicineName: "Azithromycin",
    manufacturer: "AziCare",
    category: "Antibiotic",
    description: "Antibiotic used for bacterial infections.",
    image: "https://images.unsplash.com/photo-1563213126-a4273aed2016?auto=format&fit=crop&w=800&q=60",
  },
  {
    barcode: "5555",
    medicineName: "Cetirizine",
    manufacturer: "AllerFree",
    category: "Allergy",
    description: "Antihistamine for allergy relief.",
    image: "https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&w=800&q=60",
  },
];

export function googleMapsUrl({ latitude, longitude, pharmacyName }) {
  const q = encodeURIComponent(`${pharmacyName} (${latitude},${longitude})`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function expiryInfo(expiryDate) {
  const d = new Date(expiryDate);
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { expiryStatus: "expired", expiryLabel: d.toISOString().slice(0, 10) };
  if (diffDays <= 30) return { expiryStatus: "expiring", expiryLabel: d.toISOString().slice(0, 10) };
  return { expiryStatus: "safe", expiryLabel: d.toISOString().slice(0, 10) };
}

export function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

