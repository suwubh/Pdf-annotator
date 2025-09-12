import { api } from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/api/auth/signup', { name, email, password }); 
    return response.data;
  },

  async getCurrentUser(): Promise<{ success: boolean; user: User }> {
    const response = await api.get('/api/auth/me'); 
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
