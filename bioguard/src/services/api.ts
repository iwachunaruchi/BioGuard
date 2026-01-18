import { supabase } from '../config/supabase';
import { User, FaceEncoding, AccessLog } from '../types';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

export const userService = {
  // Obtener todos los usuarios
  async getUsers(search?: string, role?: string) {
    let query = supabase.from('users').select('*');
    
    if (search) {
      query = query.ilike('full_name', `%${search}%`);
    }
    
    if (role) {
      query = query.eq('role', role);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as User[];
  },

  // Crear nuevo usuario
  async createUser(userData: { full_name: string; role: string; email?: string }) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  },

  // Actualizar usuario
  async updateUser(id: string, userData: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  },

  // Eliminar usuario
  async deleteUser(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

export const faceEncodingService = {
  // Obtener encodings de un usuario
  async getUserEncodings(userId: string) {
    const { data, error } = await supabase
      .from('face_encodings')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data as FaceEncoding[];
  },

  // Guardar encoding facial
  async saveEncoding(encodingData: {
    user_id: string;
    encoding: any;
    angle_type: string;
    image_url: string;
  }) {
    const { data, error } = await supabase
      .from('face_encodings')
      .insert([encodingData])
      .select()
      .single();
    
    if (error) throw error;
    return data as FaceEncoding;
  },

  // Eliminar encoding
  async deleteEncoding(id: string) {
    const { error } = await supabase
      .from('face_encodings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

export const accessLogService = {
  // Obtener logs de acceso
  async getAccessLogs(limit = 50) {
    const { data, error } = await supabase
      .from('access_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as AccessLog[];
  },

  // Registrar intento de acceso
  async logAccess(logData: {
    user_id?: string;
    detected_name: string;
    access_granted: boolean;
  }) {
    const { data, error } = await supabase
      .from('access_logs')
      .insert([logData])
      .select()
      .single();
    
    if (error) throw error;
    return data as AccessLog;
  },
};

export const storageService = {
  // Subir imagen
  async uploadImage(file: File, path: string) {
    const { data, error } = await supabase.storage
      .from('bioguard-images')
      .upload(path, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('bioguard-images')
      .getPublicUrl(data.path);
    
    return publicUrl;
  },

  // Eliminar imagen
  async deleteImage(path: string) {
    const { error } = await supabase.storage
      .from('bioguard-images')
      .remove([path]);
    
    if (error) throw error;
  },
};

export const enrollService = {
  async enrollFace(payload: {
    image_base64: string;
    angle_type: string;
    user_id?: string;
    full_name?: string;
    role?: string;
  }, accessToken: string) {
    const res = await fetch(`${API_BASE_URL}/api/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Error al enrolar rostro');
    }
    return res.json();
  },
};
