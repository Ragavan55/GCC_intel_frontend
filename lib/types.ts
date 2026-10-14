export type UserRole = "gcc_leader" | "advisor" | "real_estate" | "recruiter" | "other" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface ApiErrorBody {
  detail: string;
  code: string;
}

export interface ApiList<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface CitySummary {
  id: number;
  name: string;
  state: string;
  region: string;
  population: number | null;
  talent_index: number | null;
  cost_index: number | null;
  source: string;
  confidence: string;
}

export interface GccSummary {
  id: number;
  company: string;
  city: string;
  industry: string;
  headcount: number | null;
  source: string;
  confidence: string;
}