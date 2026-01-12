

export interface Employee {
  id: string; // Corresponds to Supabase Auth user UUID
  name: string;
  username: string;
  email: string;
  avatar_url: string;
  role: 'Admin' | 'Member' | 'Supervisor';
}

export type User = Employee; // The logged-in user is an Employee profile

export interface SubTask {
  id: number;
  description: string;
  completed: boolean;
}

export type TaskStatus = 'todo' | 'inprogress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
  due_time?: string;
  employee_id: string | null;
  project_id: number | null;
  sub_tasks: SubTask[]; // Stored as JSONB in Supabase
  extension_count?: number;
  assistance_requested?: boolean;
  started_at?: string;
  completed_at?: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  progress: number;
  is_public?: boolean;
  public_id?: string;
}

export type AssociationStatus = 'new' | 'contacted' | 'not_contacted' | 'response_rate';

export interface Association {
  id: string;
  name: string;
  phone: string;
  city: string;
  region: string;
  main_category: string;
  sub_category?: string;
  donation_link?: string;
  target_audience: string;
  response_status: string;
  contact?: string;
  email?: string;
  website?: string;
  status: AssociationStatus;
  response_rate?: number;
  trust_score: number;
  created_at: string;
  updated_at: string;
}