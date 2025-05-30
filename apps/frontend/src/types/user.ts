import {Role} from  "./role"
export interface UserI {
  id: number;
  name: string;
  email: string;
  lastname: string;
  role: Role;
  hiredDate: string;
  isActive: boolean;
  lastLogin: string;
  password?: string;
}

