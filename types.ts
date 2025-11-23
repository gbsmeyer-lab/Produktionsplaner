
export enum ClassName {
  ME25A = 'Me25a',
  ME25B = 'Me25b',
  ME24A = 'Me24a',
  ME24B = 'Me24b',
  ME23A = 'Me23a',
  ME23B = 'Me23b',
}

export enum ProjectType {
  WERBESPOT = 'Werbespot',
  PODCAST = 'Podcast',
  NONFICTION_SMALL = 'Nonfiktionaler Beitrag (klein)',
  NONFICTION_LARGE = 'Nonfiktionaler Beitrag (groß)',
  TRAILER = 'Trailer',
  STUDIOPROJEKT = 'Studioprojekt',
}

export enum GroupLetter {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  NONE = 'Keine',
}

export interface InventoryItem {
  id: string;
  category: string;
  name: string;
  totalStock: number;
  link?: string;
  description?: string;
  maintenanceNotes?: string; // Permanent note (e.g. damages)
}

export interface ShootLocation {
  address: string;
  date: string;
  timeStart: string;
  timeEnd: string;
}

export interface GroupMember {
  name: string;
  role: string;
}

export interface ShootPlan {
  id: string;
  editCode?: string; // New: Code to reload/edit the plan
  className: string; // Changed from ClassName to string to allow custom input
  projectType: string; // Changed from ProjectType to string to allow custom input
  projectTopic?: string; // New: Topic / Working Title
  groupLetter: GroupLetter;
  members: GroupMember[];
  locations: ShootLocation[]; // Max 8
  contactPhone: string;
  returnDate: string;
  storageDates: string[]; // Days where gear is stored at school but not returned
  createdAt: number;
}

export interface BookingItem {
  itemId: string;
  requestedCount: number;
  // Fields for teacher handover
  handedOutCount: number;
  returnedCount: number; // Tracks how many are back in stock
  specificIds: string[]; // e.g. ["Cam 1", "Cam 2"]
  notes: string;
}

export interface CustomItem {
  name: string;
  count: number;
  notes: string;
}

export interface Booking {
  id: string;
  planId: string; // Links to ShootPlan
  items: BookingItem[];
  customItems: CustomItem[];
  status: 'pending' | 'packed' | 'active' | 'returned';
  signature?: string; // Base64 image
  handoutDate?: number;
}
