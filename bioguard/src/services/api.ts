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
    
    try {
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) {
        const msg = String(error.message || '');
        if (msg.toLowerCase().includes('abort')) {
          const retry = await query.order('created_at', { ascending: false });
          if (retry.error) throw retry.error;
          return retry.data as User[];
        }
        throw error;
      }
      return data as User[];
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.toLowerCase().includes('abort')) return [];
      throw e;
    }
  },
  async getUsersRPC(search?: string, role?: string) {
    try {
      const { data, error } = await supabase.rpc('users_enriched', {
        search: search && search.trim() !== '' ? search : null,
        role_filter: role && role.trim() !== '' ? role : null,
      });
      if (error) {
        const msg = String(error.message || '');
        if (msg.toLowerCase().includes('abort')) {
          const retry = await supabase.rpc('users_enriched', {
            search: search && search.trim() !== '' ? search : null,
            role_filter: role && role.trim() !== '' ? role : null,
          });
          if (retry.error) throw retry.error;
          return retry.data as User[];
        }
        throw error;
      }
      return (data ?? []) as User[];
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.toLowerCase().includes('abort')) return [];
      throw e;
    }
  },
  async getUsersEnrichedAPI(accessToken: string, search?: string, role?: string) {
    if (!API_BASE_URL) throw new Error('API_BASE_URL no configurado');
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    const res = await fetch(`${API_BASE_URL}/api/users/enriched?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Error cargando usuarios enriquecidos');
    }
    const json = await res.json();
    return (json.users ?? []) as User[];
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
    if (!API_BASE_URL) throw new Error('API_BASE_URL no configurado')
    if (!accessToken) throw new Error('Sin token de acceso: inicia sesión y reintenta')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const res = await fetch(`${API_BASE_URL}/api/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout)
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Error al enrolar rostro');
    }
    return res.json();
  },
};
