// ============================================
// InfinityDrive — TypeScript Type Definitions
// ============================================

/** Represents a file or folder from Google Drive */
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string; // bytes as string (Drive API returns strings for large numbers)
  iconLink?: string;
  thumbnailLink?: string;
  modifiedTime?: string;
  parents?: string[];
  shared?: boolean;
  ownerEmail?: string;
}

/** Storage quota information from Drive API */
export interface StorageQuota {
  limit: number;     // bytes
  usage: number;     // bytes
  usageInDrive: number;
  usageInDriveTrash: number;
}

/** User profile returned from Drive API about.get */
export interface DriveUser {
  displayName: string;
  emailAddress: string;
  photoLink?: string;
}

/** A linked secondary account (frontend representation) */
export interface LinkedAccountInfo {
  id: string;
  email: string;
  status: 'ACTIVE' | 'EXPIRED';
  storageUsed: number | null;
  storageLimit: number | null;
  linkedAt: string;
}

/** Result of a single file transfer operation */
export interface TransferResult {
  fileId: string;
  fileName: string;
  status: 'SUCCESS' | 'FAILED';
  error?: string;
  newFileId?: string;
}

/** Request body for POST /api/transfer */
export interface TransferRequest {
  fileIds: string[];
  linkedAccountId: string;
}

/** Response from POST /api/transfer */
export interface TransferResponse {
  success: boolean;
  results: TransferResult[];
  totalTransferred: number;
  totalFailed: number;
}

/** Breadcrumb item for folder navigation */
export interface BreadcrumbItem {
  id: string;
  name: string;
}

/** Transfer progress state for UI */
export type TransferState = 'idle' | 'confirming' | 'transferring' | 'success' | 'error';
