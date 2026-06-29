import type {
  ExclusiveProject,
  Notification,
  Property,
  Requirement,
  SavedSearch,
  TeamMember,
} from "./types";

// ---------------------------------------------------------------------------
// Mock "database". These arrays are the single source of seed data; the
// propertyService module is the seam a real backend would replace.
// Ported verbatim from the PropScan Hero design.
// ---------------------------------------------------------------------------

export const PROPERTIES: Property[] = [
  { id: "001", num: "#001", title: "Sea-View 3BR Apartment, Corniche", type: "Apartment", purpose: "Sale", source: "Bayut", price: 1250000, priceLabel: "1.25M", priceFull: "1,250,000", pinLabel: "1.25M", beds: 3, baths: 3, area: 185, district: "Al Shati", city: "Jeddah", status: "Ready", posted: "2 days ago", furnishing: "Furnished", x: "34%", y: "28%", broker: { name: "Khalid Al-Harbi", agency: "Aqar Real Estate", phone: "050 123 4567", listings: 42 }, amenities: ["Sea view", "Covered parking", "24/7 security", "Gym", "Central A/C", "Balcony"], desc: "A bright 3-bedroom apartment on the Jeddah Corniche with uninterrupted Red Sea views. Recently renovated with floor-to-ceiling windows, an open-plan living area, and a private balcony. Walking distance to waterfront cafés and the Corniche promenade." },
  { id: "002", num: "#002", title: "Luxury Villa with Private Pool", type: "Villa", purpose: "Sale", source: "Wasalt", price: 4800000, priceLabel: "4.8M", priceFull: "4,800,000", pinLabel: "4.8M", beds: 5, baths: 6, area: 520, district: "Obhur Al Shamaliyah", city: "Jeddah", status: "Ready", posted: "1 day ago", furnishing: "Unfurnished", x: "22%", y: "15%", broker: { name: "Sara Al-Otaibi", agency: "Wasalt Brokers", phone: "055 998 2210", listings: 31 }, amenities: ["Private pool", "Garden", "Maid room", "Driver room", "Smart home", "Covered parking"], desc: "An expansive family villa in Obhur with a private swimming pool and landscaped garden. Five generous bedrooms, a majlis, formal and family living rooms, and a fully fitted kitchen. Gated community with beach access." },
  { id: "003", num: "#003", title: "Modern Furnished Studio", type: "Apartment", purpose: "Rent", source: "Aqar", price: 38000, priceLabel: "38K/yr", priceFull: "38,000", pinLabel: "38K", beds: 0, baths: 1, area: 55, district: "Al Hamra", city: "Jeddah", status: "Ready", posted: "5 hours ago", furnishing: "Furnished", x: "48%", y: "44%", broker: { name: "Mohammed Al-Ghamdi", agency: "Aqar Real Estate", phone: "056 441 7788", listings: 67 }, amenities: ["Furnished", "High-speed internet", "Gym access", "Pool access", "24/7 security", "Pet friendly"], desc: "A compact, fully furnished studio in Al Hamra, ideal for young professionals. Includes a kitchenette, built-in wardrobe, and access to the building gym and rooftop pool. Annual rent, flexible payment plans available." },
  { id: "004", num: "#004", title: "Off-Plan 2BR in Al Rawdah Towers", type: "Apartment", purpose: "Sale", source: "Sakani", price: 720000, priceLabel: "720K", priceFull: "720,000", pinLabel: "720K", beds: 2, baths: 2, area: 110, district: "Al Rawdah", city: "Jeddah", status: "Off-Plan", posted: "3 days ago", furnishing: "Unfurnished", x: "58%", y: "34%", broker: { name: "Sara Al-Otaibi", agency: "Sakani Partners", phone: "055 998 2210", listings: 31 }, amenities: ["Off-plan", "Payment plan", "Covered parking", "Gym", "Kids area", "Central A/C"], desc: "A two-bedroom unit in the upcoming Al Rawdah Towers, handover Q4 2027. Backed by a Sakani-approved developer with a flexible 5-year payment plan. Modern layout with a large living area and en-suite master." },
  { id: "005", num: "#005", title: "Commercial Office Floor", type: "Office", purpose: "Rent", source: "Property Finder", price: 280000, priceLabel: "280K/yr", priceFull: "280,000", pinLabel: "280K", beds: 0, baths: 2, area: 340, district: "Al Salamah", city: "Jeddah", status: "Ready", posted: "1 week ago", furnishing: "Unfurnished", x: "40%", y: "58%", broker: { name: "Khalid Al-Harbi", agency: "PF Commercial", phone: "050 123 4567", listings: 42 }, amenities: ["Open floor plan", "Dedicated parking", "Backup generator", "Fibre internet", "Meeting rooms", "Pantry"], desc: "A full commercial floor in a Grade-A building on Al Salamah’s business corridor. Open-plan with two restrooms, a pantry, and dedicated covered parking. Suited to a mid-size firm; fit-out negotiable." },
  { id: "006", num: "#006", title: "Family Villa, Al Zahra", type: "Villa", purpose: "Sale", source: "Bayut", price: 3200000, priceLabel: "3.2M", priceFull: "3,200,000", pinLabel: "3.2M", beds: 4, baths: 5, area: 410, district: "Al Zahra", city: "Jeddah", status: "Ready", posted: "4 days ago", furnishing: "Unfurnished", x: "66%", y: "52%", broker: { name: "Mohammed Al-Ghamdi", agency: "Bayut Verified", phone: "056 441 7788", listings: 67 }, amenities: ["Garden", "Maid room", "Covered parking", "Majlis", "Storage", "Central A/C"], desc: "A well-maintained four-bedroom villa in the established Al Zahra district. Spacious majlis, separate family living, and a private garden. Close to international schools and the Tahlia shopping strip." },
  { id: "007", num: "#007", title: "Penthouse with Roof Terrace", type: "Apartment", purpose: "Sale", source: "Wasalt", price: 2950000, priceLabel: "2.95M", priceFull: "2,950,000", pinLabel: "2.95M", beds: 4, baths: 4, area: 290, district: "Al Shati", city: "Jeddah", status: "Ready", posted: "6 days ago", furnishing: "Furnished", x: "30%", y: "40%", broker: { name: "Sara Al-Otaibi", agency: "Wasalt Brokers", phone: "055 998 2210", listings: 31 }, amenities: ["Roof terrace", "Sea view", "Private lift", "Smart home", "Covered parking", "Gym"], desc: "A duplex penthouse with a private roof terrace overlooking the sea. Four bedrooms, a private lift, and premium finishes throughout. The top two floors of a boutique residential tower in Al Shati." },
  { id: "008", num: "#008", title: "Off-Plan Townhouse, Al Naeem", type: "Townhouse", purpose: "Sale", source: "DealApp", price: 1850000, priceLabel: "1.85M", priceFull: "1,850,000", pinLabel: "1.85M", beds: 3, baths: 4, area: 240, district: "Al Naeem", city: "Jeddah", status: "Off-Plan", posted: "2 days ago", furnishing: "Unfurnished", x: "52%", y: "22%", broker: { name: "Khalid Al-Harbi", agency: "DealApp Realty", phone: "050 123 4567", listings: 42 }, amenities: ["Off-plan", "Payment plan", "Private garden", "Covered parking", "Community pool", "Central A/C"], desc: "A three-bedroom corner townhouse in a new gated community in Al Naeem. Private garden, rooftop, and access to shared pool and gym. Handover Q2 2027 with a developer-backed payment plan." },
  { id: "009", num: "#009", title: "Budget 1BR Apartment", type: "Apartment", purpose: "Rent", source: "Haraj", price: 26000, priceLabel: "26K/yr", priceFull: "26,000", pinLabel: "26K", beds: 1, baths: 1, area: 70, district: "Al Faisaliyah", city: "Jeddah", status: "Ready", posted: "1 day ago", furnishing: "Unfurnished", x: "44%", y: "68%", broker: { name: "Mohammed Al-Ghamdi", agency: "Private Listing", phone: "056 441 7788", listings: 67 }, amenities: ["Affordable", "Near transit", "Split A/C", "Balcony", "Parking", "Pet friendly"], desc: "An affordable one-bedroom apartment in Al Faisaliyah, close to public transport and local markets. Practical layout with a separate kitchen and a small balcony. Annual rent payable in two cheques." },
  { id: "010", num: "#010", title: "Residential Land Plot", type: "Land", purpose: "Sale", source: "OpenSooq", price: 1600000, priceLabel: "1.6M", priceFull: "1,600,000", pinLabel: "1.6M", beds: 0, baths: 0, area: 750, district: "Obhur Al Shamaliyah", city: "Jeddah", status: "Ready", posted: "1 week ago", furnishing: "—", x: "18%", y: "30%", broker: { name: "Sara Al-Otaibi", agency: "OpenSooq Land", phone: "055 998 2210", listings: 31 }, amenities: ["Residential zoning", "Corner plot", "Utilities ready", "Paved road", "Clear title", "Sea proximity"], desc: "A 750 m² residential plot in north Obhur with all utilities connected and a clear title deed. Corner location on a paved road, suitable for a private villa. Walking distance to the beachfront." },
  { id: "011", num: "#011", title: "Al Olaya 3BR Apartment", type: "Apartment", purpose: "Sale", source: "Bayut", price: 1450000, priceLabel: "1.45M", priceFull: "1,450,000", pinLabel: "1.45M", beds: 3, baths: 2, area: 170, district: "Al Olaya", city: "Riyadh", status: "Ready", posted: "3 days ago", furnishing: "Unfurnished", x: "62%", y: "62%", broker: { name: "Khalid Al-Harbi", agency: "Bayut Verified", phone: "050 123 4567", listings: 42 }, amenities: ["Central location", "Covered parking", "Gym", "24/7 security", "Central A/C", "Storage"], desc: "A three-bedroom apartment in the heart of Al Olaya, minutes from Kingdom Centre and the financial district. Bright corner unit with a fitted kitchen and a master en-suite." },
  { id: "012", num: "#012", title: "Hittin Modern Villa", type: "Villa", purpose: "Sale", source: "Aqar", price: 5600000, priceLabel: "5.6M", priceFull: "5,600,000", pinLabel: "5.6M", beds: 6, baths: 7, area: 640, district: "Hittin", city: "Riyadh", status: "Ready", posted: "5 days ago", furnishing: "Unfurnished", x: "72%", y: "24%", broker: { name: "Mohammed Al-Ghamdi", agency: "Aqar Real Estate", phone: "056 441 7788", listings: 67 }, amenities: ["Private pool", "Elevator", "Maid room", "Driver room", "Smart home", "Garden"], desc: "A contemporary six-bedroom villa in the prestigious Hittin district. Features a private pool, internal elevator, home cinema, and a landscaped garden. Premium finishes throughout, ready to move in." },
  { id: "013", num: "#013", title: "Al Malqa Duplex for Rent", type: "Apartment", purpose: "Rent", source: "Wasalt", price: 95000, priceLabel: "95K/yr", priceFull: "95,000", pinLabel: "95K", beds: 3, baths: 3, area: 210, district: "Al Malqa", city: "Riyadh", status: "Ready", posted: "2 days ago", furnishing: "Furnished", x: "80%", y: "46%", broker: { name: "Sara Al-Otaibi", agency: "Wasalt Brokers", phone: "055 998 2210", listings: 31 }, amenities: ["Furnished", "Duplex", "Covered parking", "Gym", "Pool", "Central A/C"], desc: "A furnished three-bedroom duplex in Al Malqa, close to cafés and retail along Anas Ibn Malik Road. Two-level layout with a private entrance and access to building amenities." },
  { id: "014", num: "#014", title: "New Project 2BR, Al Narjis", type: "Apartment", purpose: "Sale", source: "Sakani", price: 890000, priceLabel: "890K", priceFull: "890,000", pinLabel: "890K", beds: 2, baths: 3, area: 128, district: "Al Narjis", city: "Riyadh", status: "Off-Plan", posted: "1 day ago", furnishing: "Unfurnished", x: "68%", y: "40%", broker: { name: "Khalid Al-Harbi", agency: "Sakani Partners", phone: "050 123 4567", listings: 42 }, amenities: ["Off-plan", "Payment plan", "Covered parking", "Gym", "Kids area", "Central A/C"], desc: "A two-bedroom apartment in a new Sakani-backed development in Al Narjis, north Riyadh. Handover late 2027 with subsidised financing options. Efficient layout with two bathrooms and a guest WC." },
];

export const TYPES = ["Apartment", "Villa", "Townhouse", "Office", "Land"];

export const PLATFORMS = ["Bayut", "Wasalt", "Aqar", "Property Finder"];

export const EXCLUSIVE: ExclusiveProject[] = [
  { name: "Marsa Al Arous Residences", loc: "Obhur, Jeddah", priceRange: "SAR 1.2M – 3.4M", types: "Apartments, Penthouses", area: "120 – 410 m²" },
  { name: "Olaya Park Towers", loc: "Al Olaya, Riyadh", priceRange: "SAR 890K – 5.6M", types: "Apartments, Offices", area: "95 – 520 m²" },
  { name: "Hittin Garden Villas", loc: "Hittin, Riyadh", priceRange: "SAR 3.1M – 8.2M", types: "Villas, Townhouses", area: "320 – 720 m²" },
  { name: "Corniche Bay", loc: "Al Shati, Jeddah", priceRange: "SAR 1.6M – 4.9M", types: "Apartments, Duplexes", area: "140 – 360 m²" },
  { name: "Dhahran Hills", loc: "Doha, Dhahran", priceRange: "SAR 1.1M – 2.8M", types: "Villas, Floors", area: "180 – 440 m²" },
];

export const TEAM: TeamMember[] = [
  { name: "Faisal Al-Rashid", role: "Founder & CEO", init: "FR" },
  { name: "Noura Al-Saud", role: "Head of Product", init: "NS" },
  { name: "Omar Khan", role: "Lead Engineer", init: "OK" },
  { name: "Layla Hassan", role: "Partnerships", init: "LH" },
];

export const NOTIFS: Notification[] = [
  { unread: true, msg: "Price dropped on Al Shati villa — now SAR 1.35M (was SAR 1.45M)", time: "2h ago" },
  { unread: true, msg: "New property matching your search in Al Rawdah", time: "5h ago" },
  { unread: false, msg: "3 new Off-Plan listings in Obhur Al Shamaliyah", time: "1d ago" },
  { unread: false, msg: "Price dropped on Al Olaya apartment — now SAR 1.40M", time: "2d ago" },
];

export const SAVED_SEARCHES: SavedSearch[] = [
  { name: "Villas in Obhur", meta: "Buy · SAR 3M–6M · 4+ beds", count: "18 new" },
  { name: "Off-Plan Riyadh", meta: "Buy · Off-Plan · SAR 500K–1M", count: "7 new" },
  { name: "Studios for Rent, Jeddah", meta: "Rent · SAR 20K–40K/yr", count: "2 new" },
];

export const REQUIREMENTS: Requirement[] = [
  { title: "3BR Apartment in Al Hamra", meta: "Buy · SAR 1M–1.5M · 3+ beds", status: "4 broker responses" },
  { title: "Villa with pool, Obhur", meta: "Buy · SAR 3M–5M · 5+ beds", status: "2 broker responses" },
];

export const REASONS = [
  "Fake or fraudulent listing",
  "Incorrect price",
  "Wrong location",
  "Property already sold/rented",
  "Duplicate listing",
  "Other",
];

// Per-property freshness in days (index-aligned with PROPERTIES), ported from
// the design's freshOf() lookup table.
export const FRESH_DAYS = [0, 0, 0, 1, 2, 3, 5, 7, 9, 12, 1, 4, 2, 1];

// Curated district lists used as a fallback when window-level KSA data is
// unavailable (the design's inline DISTRICTS map).
export const DISTRICTS: Record<string, string[]> = {
  Riyadh: ["Al Olaya", "Hittin", "Al Malqa", "Al Narjis", "Al Yasmin", "Al Aqiq", "Al Sahafa", "Al Nakheel", "Al Wurud", "King Abdullah District", "Al Rabi", "Qurtubah"],
  Jeddah: ["Al Shati", "Al Hamra", "Al Rawdah", "Obhur Al Shamaliyah", "Al Salamah", "Al Zahra", "Al Naeem", "Al Faisaliyah", "Al Andalus", "Al Basateen", "Al Marjan"],
  Mecca: ["Al Aziziyah", "Al Rusaifah", "Al Awali", "Al Shawqiyah", "Al Nuzha", "Al Zahir", "Al Khansa"],
  Medina: ["Al Aqiq", "Quba", "Al Haram District", "Al Khalidiyah", "Al Aridh", "Shuran", "Al Iskan"],
  Dammam: ["Al Faisaliyah", "Al Shati", "Al Aziziyah", "King Fahd Suburb", "Al Anoud", "Al Mazruiyah", "Uhud"],
  Khobar: ["Al Aqrabiyah", "Al Olaya", "Al Rakah", "Corniche District", "Al Hizam", "Al Yarmouk", "Al Bandariyah"],
  Dhahran: ["Doha", "Al Tahlia", "University District", "Al Jamiah"],
  Taif: ["Al Hawiyah", "Al Shifa", "Al Salamah", "Al Qamariyah", "Al Wisam"],
  Tabuk: ["Al Faisaliyah", "Al Wuroud", "Al Rawdah", "Al Salam", "Al Aziziyah"],
  Buraidah: ["Al Rabiyah", "Al Iskan", "Al Nahdah", "Al Salimiyah", "Al Rayyan"],
  "Khamis Mushait": ["Al Mathnah", "Al Rabwah", "Al Khalidiyah", "Al Aziziyah"],
  Abha: ["Al Sad", "Al Numas", "Al Khalidiyah", "Al Marooj", "Al Manhal"],
  Hail: ["Al Mughaidhah", "Al Khuzama", "Al Wadi", "Al Nuqrah"],
  Yanbu: ["Al Nakheel", "Al Sharm", "Radwa", "Al Balad"],
  "Al Ahsa": ["Al Hofuf", "Al Mubarraz", "Al Salmaniyah", "Al Rashidiyah"],
  Jubail: ["Al Fanateer", "Al Deffi", "Al Huwailat", "Industrial City"],
  Najran: ["Al Faisaliyah", "Al Mashaliah", "Al Qabel", "Al Ghuwaila"],
  Jazan: ["Al Rawdah", "Al Suwais", "Al Matar", "Al Shati"],
};
