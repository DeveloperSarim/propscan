export interface Broker {
  name: string;
  agency: string;
  phone: string;
  listings: number;
}

export interface Property {
  id: string;
  num: string;
  title: string;
  type: string;
  purpose: "Sale" | "Rent";
  source: string;
  price: number;
  priceLabel: string;
  priceFull: string;
  pinLabel: string;
  beds: number;
  baths: number;
  area: number;
  district: string;
  city: string;
  status: string;
  posted: string;
  furnishing: string;
  x: string;
  y: string;
  lat?: number;
  lng?: number;
  images?: string[];
  broker: Broker;
  amenities: string[];
  desc: string;
  listingUrl?: string;
  regaVerified?: boolean;
  falLicense?: string;
  adLicense?: string;
  adLicenseExpiry?: number;
  regaStreet?: string;
  completionStatus?: string;
}

export interface ExclusiveProject {
  name: string;
  loc: string;
  priceRange: string;
  types: string;
  area: string;
}

export interface TeamMember {
  name: string;
  role: string;
  init: string;
}

export interface Notification {
  unread: boolean;
  msg: string;
  time: string;
}

export interface SavedSearch {
  name: string;
  meta: string;
  count: string;
}

export interface Requirement {
  title: string;
  meta: string;
  status: string;
}
