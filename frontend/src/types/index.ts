export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface PDF {
  updatedAt: any;
  lastViewedAt: any;
  uploadedAt: any;
  createdAt: any;
  uuid: string;
  originalName: string;
  fileSize: number;
  totalPages: number;
  uploadDate: string;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
  };
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  pageWidth?: number;
  pageHeight?: number;
}

export interface Highlight {
  uuid: string;
  pdfUuid: string;
  pageNumber: number;
  text: string;
  boundingBox: BoundingBox;
  color: string;
  note: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface HighlightsByPage {
  [pageNumber: number]: Highlight[];
}

export interface CreateHighlightRequest {
  pdfUuid: string;
  pageNumber: number;
  text: string;
  boundingBox: BoundingBox;
  color?: string;
  note?: string;
}