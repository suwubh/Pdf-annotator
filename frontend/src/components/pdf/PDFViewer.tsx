import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Palette,
  MessageSquare
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { highlightPlugin } from '@react-pdf-viewer/highlight';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';

import { pdfService } from '../../services/pdf';
import { highlightService } from '../../services/highlights';
import { Button } from '../../styles/GlobalStyle';
import { CreateHighlightRequest, BoundingBox } from '../../types';
import HighlightTools from './HighlightTools';
import { useAuth } from '../../context/AuthContext';

const ViewerContainer = styled.div`
  display: flex;
  height: 100vh;
  background: var(--background);
`;

const Sidebar = styled.div<{ isOpen: boolean }>`
  width: ${({ isOpen }) => isOpen ? '320px' : '0'};
  background: var(--surface);
  border-right: 1px solid var(--border);
  transition: width 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const MainViewer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const CustomToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    gap: 0.5rem;
  }
`;

const ToolbarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PDFContainer = styled.div<{ isSelectionMode: boolean }>`
  flex: 1;
  overflow: hidden;
  background: #f5f5f5;
  cursor: ${({ isSelectionMode }) => isSelectionMode ? 'text' : 'default'};
  
  /* Custom styles for react-pdf-viewer */
  .rpv-core__viewer {
    height: 100% !important;
  }
  
  .rpv-default-layout__main {
    background: #f5f5f5 !important;
  }
  
  .rpv-core__page-layer {
    position: relative;
  }
  
  /* Custom highlight styles */
  .custom-highlight {
    position: absolute;
    border-radius: 2px;
    cursor: pointer;
    transition: opacity 0.2s ease;
    opacity: 0.3;
  }
  
  .custom-highlight:hover {
    opacity: 0.5;
    box-shadow: 0 0 0 2px currentColor;
  }
  
  /* Hide default toolbar - we use custom one */
  .rpv-toolbar {
    display: none;
  }
  
  /* Hide default sidebar */
  .rpv-default-layout__sidebar {
    display: none !important;
  }
  
  @media (max-width: 768px) {
    .rpv-default-layout__sidebar {
      display: none;
    }
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: var(--text-secondary);
`;

const PDFViewer: React.FC = () => {
  const { pdfUuid } = useParams<{ pdfUuid: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionBounds, setSelectionBounds] = useState<BoundingBox | null>(null);
  const [highlightColor, setHighlightColor] = useState<string>('#ffff00');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isPDFLoading, setIsPDFLoading] = useState<boolean>(true);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const { data: pdfData, isLoading: isPdfDetailsLoading } = useQuery({
    queryKey: ['pdf', pdfUuid],
    queryFn: () => pdfService.getPDFDetails(pdfUuid!),
    enabled: !!pdfUuid,
  });

  const { data: highlightsData, refetch: refetchHighlights } = useQuery({
    queryKey: ['highlights', pdfUuid],
    queryFn: () => highlightService.getPDFHighlights(pdfUuid!),
    enabled: !!pdfUuid,
  });

  const createHighlightMutation = useMutation({
    mutationFn: highlightService.createHighlight,
    onSuccess: () => {
      refetchHighlights();
      toast.success('Highlight added successfully');
      setSelectedText('');
      setSelectionBounds(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create highlight');
    }
  });

  const deleteHighlightMutation = useMutation({
    mutationFn: highlightService.deleteHighlight,
    onSuccess: () => {
      refetchHighlights();
      toast.success('Highlight deleted');
    },
  });

  const pdf = pdfData?.pdf;
  const highlights = highlightsData?.highlights || [];
  const highlightsByPage = highlightsData?.highlightsByPage || {};

  useEffect(() => {
    const loadPDFWithAuth = async () => {
      if (!pdfUuid || !token) return;

      try {
        setIsPDFLoading(true);
        setPdfError(null);
        
        const pdfUrl = pdfService.getPDFViewURL(pdfUuid);
        console.log('Fetching PDF from:', pdfUrl);
        console.log('Using token:', token);

        const response = await fetch(pdfUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/pdf',
          },
          credentials: 'same-origin',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(blobUrl);
        setIsPDFLoading(false);
        
        console.log('PDF loaded successfully as blob URL');
      } catch (error: any) {
        console.error('Error loading PDF:', error);
        setPdfError(error.message || 'Failed to load PDF');
        setIsPDFLoading(false);
        toast.error('Failed to load PDF: ' + error.message);
      }
    };

    loadPDFWithAuth();

    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfUuid, token]);

  const addHighlight = useCallback((note: string = '') => {
    if (!selectedText || !selectionBounds || !pdfUuid) return;

    const highlightData: CreateHighlightRequest = {
      pdfUuid,
      pageNumber: currentPage,
      text: selectedText,
      boundingBox: selectionBounds,
      color: highlightColor,
      note
    };

    createHighlightMutation.mutate(highlightData);
  }, [selectedText, selectionBounds, pdfUuid, currentPage, highlightColor, createHighlightMutation]);

  const deleteHighlight = useCallback((highlightUuid: string) => {
    deleteHighlightMutation.mutate(highlightUuid);
  }, [deleteHighlightMutation]);

  const highlightPluginInstance = highlightPlugin({
    renderHighlights: (props) => {
      const currentPageHighlights = highlightsByPage[props.pageIndex + 1] || [];
      
      return (
        <>
          {currentPageHighlights.map((highlight) => (
            <div
              key={highlight.uuid}
              className="custom-highlight"
              style={{
                left: `${highlight.boundingBox.x}px`,
                top: `${highlight.boundingBox.y}px`,
                width: `${highlight.boundingBox.width}px`,
                height: `${highlight.boundingBox.height}px`,
                backgroundColor: highlight.color,
                color: highlight.color,
              }}
              onClick={(e) => {
                e.stopPropagation();
                deleteHighlight(highlight.uuid);
              }}
              title={`"${highlight.text}"${highlight.note ? ` - ${highlight.note}` : ''}\nClick to delete`}
            />
          ))}
        </>
      );
    }
  });

  const toolbarPluginInstance = toolbarPlugin();
  const { renderDefaultToolbar, Toolbar } = toolbarPluginInstance;

  const transform = (slot: any) => ({
    ...slot,
    Download: () => <></>,
    Print: () => <></>,
    Open: () => <></>,
  });

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const zoomPluginInstance = zoomPlugin();

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [], 
    renderToolbar: (Toolbar: any) => (
      <Toolbar>
        {renderDefaultToolbar(transform)}
      </Toolbar>
    ),
  });

  const handleDocumentLoad = (e: any) => {
    setTotalPages(e.doc.numPages);
    console.log('PDF document loaded:', e.doc.numPages, 'pages');
  };

  const handlePageChange = (e: any) => {
    setCurrentPage(e.currentPage + 1);
  };

  useEffect(() => {
    if (!isSelectionMode) return;

    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.toString().trim() === '') return;

      const selectedText = selection.toString().trim();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      const pageElement = range.commonAncestorContainer.parentElement?.closest('.rpv-core__page-layer');
      if (!pageElement) return;
      
      const pageRect = pageElement.getBoundingClientRect();

      const boundingBox: BoundingBox = {
        x: rect.left - pageRect.left,
        y: rect.top - pageRect.top,
        width: rect.width,
        height: rect.height,
        pageWidth: pageRect.width,
        pageHeight: pageRect.height
      };

      setSelectedText(selectedText);
      setSelectionBounds(boundingBox);
    };

    const handleMouseUp = () => {
      setTimeout(handleSelection, 10);
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [isSelectionMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' && selectedText) {
        e.preventDefault();
        addHighlight();
      }
      if (e.key === 'Escape') {
        setSelectedText('');
        setSelectionBounds(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedText, addHighlight]);

  if (isPdfDetailsLoading || isPDFLoading) {
    return <LoadingMessage>Loading PDF...</LoadingMessage>;
  }

  if (!pdf) {
    return <LoadingMessage>PDF not found</LoadingMessage>;
  }

  if (!token) {
    return <LoadingMessage>Authentication required</LoadingMessage>;
  }

  if (pdfError) {
    return <LoadingMessage>Error loading PDF: {pdfError}</LoadingMessage>;
  }

  if (!pdfBlobUrl) {
    return <LoadingMessage>PDF not available</LoadingMessage>;
  }

  return (
    <ViewerContainer>
      <Sidebar isOpen={sidebarOpen}>
        <HighlightTools
          highlights={highlights}
          selectedText={selectedText}
          selectionBounds={selectionBounds}
          highlightColor={highlightColor}
          onColorChange={setHighlightColor}
          onAddHighlight={addHighlight}
          onDeleteHighlight={deleteHighlight}
          onClearSelection={() => {
            setSelectedText('');
            setSelectionBounds(null);
          }}
        />
      </Sidebar>

      <MainViewer>
        <CustomToolbar>
          <ToolbarSection>
            <Button
              variant="secondary"
              onClick={() => navigate('/library')}
            >
              <ChevronLeft size={16} />
              Back
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Palette size={16} />
              {sidebarOpen ? 'Hide' : 'Show'} Tools
            </Button>
          </ToolbarSection>

          <ToolbarSection>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Page {currentPage} of {totalPages}
            </span>
          </ToolbarSection>

          <ToolbarSection>
            <Button
              variant={isSelectionMode ? 'primary' : 'secondary'}
              onClick={() => setIsSelectionMode(!isSelectionMode)}
            >
              <MessageSquare size={16} />
              {isSelectionMode ? 'Exit' : 'Select'} Text
            </Button>
          </ToolbarSection>
        </CustomToolbar>

        <PDFContainer isSelectionMode={isSelectionMode}>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer
              fileUrl={pdfBlobUrl}
              plugins={[
                defaultLayoutPluginInstance,
                highlightPluginInstance,
                pageNavigationPluginInstance,
                zoomPluginInstance,
              ]}
              onDocumentLoad={handleDocumentLoad}
              onPageChange={handlePageChange}
            />
          </Worker>
        </PDFContainer>
      </MainViewer>
    </ViewerContainer>
  );
};

export default PDFViewer;
