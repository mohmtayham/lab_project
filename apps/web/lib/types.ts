export interface AuthUser {
  id: number;
  name: string;
  email?: string;
  roles: string[];
  permissions?: string[];
}

export interface AuthResponse {
  id: number;
  name: string;
  roles: string[];
  accessToken: string;
  refreshToken: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export type Gender = 'male' | 'female' | 'other' | 'unknown';

export interface Patient {
  id: number;
  patientNumber: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gender: Gender;
  dateOfBirth?: string;
  createdAt: string;
}

export interface Test {
  id: number;
  name: string;
  category?: string;
  sampleType?: string;
  price: string | number;
  loincCode?: string;
  unit?: string;
  referenceRange?: string;
}

export interface Order {
  id: number;
  patientId: number;
  status: 'pending' | 'approved' | 'cancelled';
  notes?: string;
  createdAt: string;
  patient?: Patient;
  doctor?: { id: number; name: string } | null;
  requests?: TestRequest[];
}

export interface TestRequestItem {
  id: number;
  testId: number;
  status: 'pending' | 'sampled' | 'in_analysis' | 'completed' | 'rejected';
  test?: Test;
  request?: TestRequest;
  results?: Result[];
}

export interface TestRequest {
  id: number;
  orderId: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  order?: Order;
  items?: TestRequestItem[];
  samples?: Sample[];
}

export interface Sample {
  id: number;
  requestId: number;
  qrCode?: string;
  sampleType?: string;
  status: 'collected' | 'in_lab' | 'processed' | 'rejected';
  collectedAt?: string;
  createdAt: string;
  request?: TestRequest;
  collector?: { id: number; name: string } | null;
}

export interface Device {
  id: number;
  name: string;
  status: 'active' | 'maintenance' | 'offline';
  calibratedAt?: string;
}

export interface Result {
  id: number;
  requestItemId: number;
  value?: string;
  comments?: string;
  status: 'pending' | 'entered' | 'reviewed' | 'approved' | 'rejected';
  approvedAt?: string;
  createdAt: string;
  requestItem?: TestRequestItem & { test?: Test };
  device?: Device | null;
  enteredByUser?: { id: number; name: string } | null;
  history?: ResultHistory[];
}

export interface ResultHistory {
  id: number;
  oldValue?: string;
  newValue?: string;
  changedAt: string;
  changedByUser?: { id: number; name: string } | null;
}

export interface Payment {
  id: number;
  orderId: number;
  patientId: number;
  totalAmount: string | number;
  status: 'pending' | 'paid' | 'refunded' | 'cancelled';
  createdAt: string;
  patient?: Patient;
  items?: { id: number; price: string | number; requestItem?: TestRequestItem }[];
}

export interface SupportRequest {
  id: number;
  patientId: number;
  requestId?: number;
  discountPercentage: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  patient?: Patient;
}

export interface AppUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}

export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  patients: number;
  pendingOrders: number;
  inProgressRequests: number;
  pendingResults: number;
  revenue: number;
  activeDevices: number;
}
