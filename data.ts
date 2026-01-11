import type { User, Employee, Task, Project } from './types';

export const initialCurrentUser: User = {
  id: '',
  name: '',
  username: '',
  email: '',
  avatar_url: '',
  role: 'Admin',
};

export const initialEmployees: Employee[] = [];

export const initialProjects: Project[] = [];

export const initialTasks: Task[] = [];
