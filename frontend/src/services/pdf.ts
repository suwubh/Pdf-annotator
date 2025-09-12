import { api } from './api';
import { PDF } from '../types';

export const pdfService = {
  async uploadPDF(file: File): Promise<{ success: boolean; pdf: PDF }> {
    const formData = new FormData();
    formData.append('pdf', file);

    const response = await api.post('/api/pdf/upload', formData, { 
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getUserPDFs(): Promise<{ success: boolean; pdfs: PDF[]; count: number }> {
    const response = await api.get('/api/pdf/my-pdfs'); 
    return response.data;
  },

  async getPDFDetails(uuid: string): Promise<{ success: boolean; pdf: PDF }> {
    const response = await api.get(`/api/pdf/${uuid}`); 
    return response.data;
  },

  async deletePDF(uuid: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/api/pdf/${uuid}`); 
    return response.data;
  },

  async renamePDF(uuid: string, newName: string): Promise<{ success: boolean; pdf: PDF }> {
    const response = await api.put(`/api/pdf/${uuid}`, { originalName: newName }); 
    return response.data;
  },

  getPDFViewURL(uuid: string): string {
    const token = localStorage.getItem('token');
    return `${api.defaults.baseURL}/api/pdf/view/${uuid}?token=${token}`; 
  },
};
