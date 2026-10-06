export type Role = 'ADMIN' | 'VOLUNTEER';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string | null;
  username: string;
  fullName: string;
  role: Role;
}

export interface Item {
  id: number;
  name: string;
  category: string;
  bowlCount: number;
  note: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItemRequest {
  name: string;
  category: string;
  bowlCount: number;
  note: string | null;
  active?: boolean;
}

export interface Haribhakt {
  id: number;
  name: string;
  mobileNumber: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HaribhaktRequest {
  name: string;
  mobileNumber: string | null;
  address: string | null;
  notes: string | null;
}

export interface FestivalEvent {
  id: number;
  year: number;
  name: string;
  location: string | null;
  annakutDate: string | null;
  active: boolean;
  createdAt: string;
}

export interface FestivalEventRequest {
  year: number;
  name: string;
  location: string | null;
  annakutDate: string;
  active?: boolean;
}

export type BatchStatus = 'ALLOCATED' | 'COLLECTED';

export interface BatchItem {
  id: number;
  itemId: number;
  itemName: string;
  itemCategory: string;
  quantity: number;
  notes: string | null;
}

export interface AllocationBatch {
  id: number;
  eventId: number;
  eventYear: number;
  haribhaktId: number;
  haribhaktName: string;
  haribhaktMobile: string | null;
  batchNumber: number;
  status: BatchStatus;
  allocatedDate: string | null;
  allocatedBy: string | null;
  notes: string | null;
  items: BatchItem[];
}

export interface BulkAllocationRequest {
  eventId?: number | null;
  haribhaktId: number;
  itemIds: number[];
  quantity?: number;
  notes?: string | null;
}

export interface AppUser {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  enabled: boolean;
}

export interface UserCreateRequest {
  username: string;
  password: string;
  fullName: string;
  role: Role;
}
