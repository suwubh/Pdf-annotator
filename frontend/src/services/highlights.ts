import { api } from './api';
import { Highlight, CreateHighlightRequest, HighlightsByPage } from '../types';

export const highlightService = {
  async createHighlight(data: CreateHighlightRequest): Promise<{ success: boolean; highlight: Highlight }> {
    const response = await api.post('/api/highlights', data); 
    return response.data;
  },

  async getPDFHighlights(pdfUuid: string): Promise<{
    success: boolean;
    highlights: Highlight[];
    highlightsByPage: HighlightsByPage;
    totalHighlights: number;
  }> {
    const response = await api.get(`/api/highlights/pdf/${pdfUuid}`); 
    return response.data;
  },

  async updateHighlight(uuid: string, updates: Partial<Highlight>): Promise<{ success: boolean; highlight: Highlight }> {
    const response = await api.put(`/api/highlights/${uuid}`, updates); 
    return response.data;
  },

  async deleteHighlight(uuid: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/api/highlights/${uuid}`); 
    return response.data;
  },

  async searchHighlights(pdfUuid: string, query: string): Promise<{ success: boolean; highlights: Highlight[] }> {
    const response = await api.get(`/api/highlights/search/${pdfUuid}?q=${encodeURIComponent(query)}`); 
    return response.data;
  },
};
