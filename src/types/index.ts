export interface User {
  id: string;
  email: string;
  name: string;
  department: string | null;
  designation: string | null;
  phone: string | null;
  officeLocation: string | null;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}