import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { pdfService } from '../../services/pdf';
import { Button, Card } from '../../styles/GlobalStyle';

const UploadContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const DropZone = styled.div<{ isDragOver: boolean; hasError: boolean }>`
  border: 2px dashed ${({ isDragOver, hasError }) => 
    hasError ? 'var(--error-color)' : 
    isDragOver ? 'var(--primary-color)' : 'var(--border)'};
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  background: ${({ isDragOver }) => isDragOver ? 'rgba(37, 99, 235, 0.05)' : 'var(--surface)'};
  transition: all 0.2s ease;
  cursor: pointer;
  margin-bottom: 2rem;
  
  &:hover {
    border-color: var(--primary-color);
    background: rgba(37, 99, 235, 0.02);
  }
`;

const UploadIcon = styled.div<{ hasError: boolean }>`
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  background: ${({ hasError }) => hasError ? 'var(--error-color)' : 'var(--primary-color)'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const UploadTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const UploadDescription = styled.p`
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const FileInput = styled.input`
  display: none;
`;

const UploadedFile = styled(Card)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 1rem;
  background: var(--background);
`;

const FileIcon = styled.div<{ status: 'pending' | 'uploading' | 'success' | 'error' }>`
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: ${({ status }) => {
    switch (status) {
      case 'pending': return 'var(--secondary-color)';
      case 'uploading': return 'var(--warning-color)';
      case 'success': return 'var(--success-color)';
      case 'error': return 'var(--error-color)';
      default: return 'var(--primary-color)';
    }
  }};
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
`;

const FileSize = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  margin-top: 0.5rem;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: var(--primary-color);
  width: ${({ progress }) => progress}%;
  transition: width 0.3s ease;
`;

const RemoveButton = styled.button`
  background: none;
  color: var(--text-secondary);
  padding: 0.5rem;
  border-radius: 4px;
  
  &:hover {
    background: var(--error-color);
    color: white;
  }
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

interface UploadedFileInfo {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  pdfUuid?: string;
}

const PDFUpload: React.FC = () => {
  const [files, setFiles] = useState<UploadedFileInfo[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: pdfService.uploadPDF,
  });

  const validateFile = (file: File): string | undefined => {
    if (file.type !== 'application/pdf') {
      return 'Only PDF files are allowed';
    }
    if (file.size > 50 * 1024 * 1024) {
      return 'File size must be less than 50MB';
    }
    return undefined;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const addFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: UploadedFileInfo[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      const fileInfo: UploadedFileInfo = {
        file,
        id: Math.random().toString(36).substr(2, 9),
        status: error ? 'error' : 'pending',
        progress: 0,
        error
      };
      validFiles.push(fileInfo);
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    for (const fileInfo of pendingFiles) {
      setFiles(prev => prev.map(f => 
        f.id === fileInfo.id 
          ? { ...f, status: 'uploading', progress: 50 }
          : f
      ));

      try {
        const response = await uploadMutation.mutateAsync(fileInfo.file);
        
        setFiles(prev => prev.map(f => 
          f.id === fileInfo.id 
            ? { ...f, status: 'success', progress: 100, pdfUuid: response.pdf.uuid }
            : f
        ));
        
        toast.success(`${response.pdf.originalName} uploaded successfully!`);
        
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Upload failed';
        setFiles(prev => prev.map(f => 
          f.id === fileInfo.id 
            ? { ...f, status: 'error', error: errorMessage }
            : f
        ));
        toast.error(errorMessage);
      }
    }
    
    queryClient.invalidateQueries({ queryKey: ['user-pdfs'] });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  };

  const hasErrors = files.some(f => f.status === 'error');
  const hasUploading = files.some(f => f.status === 'uploading');
  const hasPendingFiles = files.some(f => f.status === 'pending');
  const successfulUploads = files.filter(f => f.status === 'success');

  return (
    <UploadContainer>
      <DropZone
        isDragOver={isDragOver}
        hasError={hasErrors}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <UploadIcon hasError={hasErrors}>
          {hasErrors ? <AlertCircle size={28} /> : <Upload size={28} />}
        </UploadIcon>
        
        <UploadTitle>
          {files.length === 0 ? 'Upload PDF Documents' : 
           hasErrors ? 'Some files have errors' : 'Add more files'}
        </UploadTitle>
        
        <UploadDescription>
          Drag and drop PDF files here, or click to browse.<br />
          Maximum file size: 50MB per file.
        </UploadDescription>
        
        <Button variant="secondary">
          Choose Files
        </Button>
        
        <FileInput
          id="file-input"
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={handleFileSelect}
        />
      </DropZone>

      {files.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Selected Files ({files.length})
          </h3>
          
          {files.map((fileInfo) => (
            <UploadedFile key={fileInfo.id}>
              <FileIcon status={fileInfo.status}>
                {fileInfo.status === 'success' ? (
                  <CheckCircle size={20} />
                ) : fileInfo.status === 'error' ? (
                  <AlertCircle size={20} />
                ) : (
                  <FileText size={20} />
                )}
              </FileIcon>
              
              <FileInfo>
                <FileName>{fileInfo.file.name}</FileName>
                <FileSize>{formatFileSize(fileInfo.file.size)}</FileSize>
                
                {fileInfo.status === 'uploading' && (
                  <ProgressBar>
                    <ProgressFill progress={fileInfo.progress} />
                  </ProgressBar>
                )}
                
                {fileInfo.error && (
                  <ErrorMessage>
                    <AlertCircle size={14} />
                    {fileInfo.error}
                  </ErrorMessage>
                )}
              </FileInfo>
              
              {fileInfo.status === 'success' && fileInfo.pdfUuid && (
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/pdf/${fileInfo.pdfUuid}`)}
                >
                  View
                </Button>
              )}
              
              {fileInfo.status !== 'uploading' && (
                <RemoveButton onClick={() => removeFile(fileInfo.id)}>
                  <X size={16} />
                </RemoveButton>
              )}
            </UploadedFile>
          ))}
          
          <ActionButtons>
            {hasPendingFiles && (
              <Button
                onClick={uploadFiles}
                disabled={hasUploading}
              >
                {hasUploading ? 'Uploading...' : `Upload ${files.filter(f => f.status === 'pending').length} Files`}
              </Button>
            )}
            
            {successfulUploads.length > 0 && (
              <Button
                variant="secondary"
                onClick={() => navigate('/library')}
              >
                View Library
              </Button>
            )}
            
            <Button
              variant="secondary"
              onClick={() => setFiles([])}
            >
              Clear All
            </Button>
          </ActionButtons>
        </div>
      )}
    </UploadContainer>
  );
};

export default PDFUpload;
