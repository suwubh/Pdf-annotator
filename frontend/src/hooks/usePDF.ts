// src/hooks/usePDF.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pdfService } from '../services/pdf';
import toast from 'react-hot-toast';

export const usePDFs = () => {
  return useQuery({
    queryKey: ['user-pdfs'],
    queryFn: pdfService.getUserPDFs,
  });
};

export const usePDF = (uuid: string) => {
  return useQuery({
    queryKey: ['pdf', uuid],
    queryFn: () => pdfService.getPDFDetails(uuid),
    enabled: !!uuid,
  });
};

export const useUploadPDF = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: pdfService.uploadPDF,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-pdfs'] });
      toast.success(`${data.pdf.originalName} uploaded successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Upload failed');
    }
  });
};

export const useDeletePDF = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: pdfService.deletePDF,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-pdfs'] });
      toast.success('PDF deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete PDF');
    }
  });
};
