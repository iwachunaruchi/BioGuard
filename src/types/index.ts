export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'operator';
  createdAt: string;
}

export interface Person {
  id: string;
  name: string;
  photo: string; // base64 encoded
  listType: 'whitelist' | 'blacklist';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AccessLog {
  id: string;
  personId: string;
  action: 'access_granted' | 'access_denied';
  timestamp: string;
  userId: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}