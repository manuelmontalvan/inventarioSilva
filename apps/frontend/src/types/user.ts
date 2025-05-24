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
export interface Role {
  id: number;
  name: string;
}