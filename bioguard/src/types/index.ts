export interface User {
  id: string;
  full_name: string;
  role: 'admin' | 'whitelist' | 'blacklist' | 'visitor';
  created_at: string;
  email?: string;
}

export interface FaceEncoding {
  id: string;
  user_id: string;
  encoding: any;
  angle_type: 'front' | 'left' | 'right' | 'up' | 'down';
  image_url: string;
}

export interface AccessLog {
  id: string;
  user_id: string | null;
  detected_name: string;
  access_granted: boolean;
  timestamp: string;
}

export interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
  error: string | null;
}