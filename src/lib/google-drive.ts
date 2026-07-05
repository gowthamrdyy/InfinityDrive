// ============================================
// InfinityDrive — Google Drive API Helpers
// ============================================
// Provides typed wrappers around the Google Drive v3 API.
// All API calls are wrapped with exponential backoff.

import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { withBackoff } from './backoff';
import type { DriveFile, StorageQuota, DriveUser } from '@/types';

/**
 * Creates a Drive API client from an access token (for primary accounts).
 */
export function createDriveClient(accessToken: string): drive_v3.Drive {
  const auth = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth });
}

/**
 * Creates a Drive API client from a refresh token (for secondary accounts).
 * Automatically handles token refresh.
 */
export function createDriveClientFromRefreshToken(
  refreshToken: string
): drive_v3.Drive {
  const auth = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ refresh_token: refreshToken });
  return google.drive({ version: 'v3', auth });
}

/**
 * Lists files in a Drive folder (or root if no folderId specified).
 * Returns a typed array of DriveFile objects.
 */
export async function listFiles(
  drive: drive_v3.Drive,
  folderId?: string
): Promise<DriveFile[]> {
  
  // If 'all' is passed, fetch everything including folders
  const q = folderId === 'all' 
    ? `trashed = false`
    : folderId === 'shared'
      ? `sharedWithMe = true and trashed = false`
      : `'${folderId || 'root'}' in parents and trashed = false`;

  const response = await withBackoff(() =>
    drive.files.list({
      q,
      fields: 'files(id, name, mimeType, size, iconLink, thumbnailLink, modifiedTime, parents, shared)',
      orderBy: 'folder,name',
      pageSize: 200,
    })
  );

  return (response.data.files || []).map((file) => ({
    id: file.id!,
    name: file.name!,
    mimeType: file.mimeType!,
    size: file.size || undefined,
    iconLink: file.iconLink || undefined,
    thumbnailLink: file.thumbnailLink || undefined,
    modifiedTime: file.modifiedTime || undefined,
    parents: file.parents || undefined,
    shared: file.shared || undefined,
  }));
}

/**
 * Gets storage quota and user information from Drive.
 */
export async function getStorageQuota(
  drive: drive_v3.Drive
): Promise<{ quota: StorageQuota; user: DriveUser }> {
  const response = await withBackoff(() =>
    drive.about.get({
      fields: 'storageQuota, user',
    })
  );

  const sq = response.data.storageQuota!;
  const u = response.data.user!;

  return {
    quota: {
      limit: parseInt(sq.limit || '0', 10),
      usage: parseInt(sq.usage || '0', 10),
      usageInDrive: parseInt(sq.usageInDrive || '0', 10),
      usageInDriveTrash: parseInt(sq.usageInDriveTrash || '0', 10),
    },
    user: {
      displayName: u.displayName || '',
      emailAddress: u.emailAddress || '',
      photoLink: u.photoLink || undefined,
    },
  };
}

/**
 * Shares a file with a user by granting "reader" access.
 * This is step 1 of the Share→Copy→Delete pipeline.
 */
export async function shareFile(
  drive: drive_v3.Drive,
  fileId: string,
  email: string
): Promise<string> {
  const response = await withBackoff(() =>
    drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'user',
        emailAddress: email,
      },
      // Don't send notification emails
      sendNotificationEmail: false,
    })
  );

  return response.data.id!;
}

/**
 * Copies a shared file into the secondary account's Drive.
 * This is step 2 of the pipeline — creates a new file owned by the copier.
 */
export async function copyFile(
  drive: drive_v3.Drive,
  fileId: string,
  name: string,
  parentId?: string
): Promise<string> {
  const requestBody: drive_v3.Schema$File = { name };
  if (parentId) {
    requestBody.parents = [parentId];
  }

  const response = await withBackoff(() =>
    drive.files.copy({
      fileId,
      requestBody,
    })
  );

  return response.data.id!;
}

/**
 * Deletes a file from Drive. This is step 3 — cleanup from primary account.
 */
export async function deleteFile(
  drive: drive_v3.Drive,
  fileId: string
): Promise<void> {
  await withBackoff(() =>
    drive.files.delete({ fileId })
  );
}

/**
 * Creates a new folder in Drive.
 * Used during recursive folder transfers.
 */
export async function createFolder(
  drive: drive_v3.Drive,
  name: string,
  parentId?: string
): Promise<string> {
  const requestBody: drive_v3.Schema$File = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) {
    requestBody.parents = [parentId];
  }

  const response = await withBackoff(() =>
    drive.files.create({
      requestBody,
      fields: 'id',
    })
  );

  return response.data.id!;
}

/**
 * Recursively lists all children of a folder.
 * Returns all files/subfolders (non-recursive list — one level deep).
 */
export async function listFolderChildren(
  drive: drive_v3.Drive,
  folderId: string
): Promise<DriveFile[]> {
  const allFiles: DriveFile[] = [];
  let pageToken: string | undefined;

  do {
    const response = await withBackoff(() =>
      drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'nextPageToken, files(id, name, mimeType, size)',
        pageSize: 100,
        pageToken,
      })
    );

    const files = (response.data.files || []).map((file) => ({
      id: file.id!,
      name: file.name!,
      mimeType: file.mimeType!,
      size: file.size || undefined,
    }));

    allFiles.push(...files);
    pageToken = response.data.nextPageToken || undefined;
  } while (pageToken);

  return allFiles;
}

/**
 * Gets file metadata (used to check if a file is a folder).
 */
export async function getFileMetadata(
  drive: drive_v3.Drive,
  fileId: string
): Promise<DriveFile> {
  const response = await withBackoff(() =>
    drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size',
    })
  );

  return {
    id: response.data.id!,
    name: response.data.name!,
    mimeType: response.data.mimeType!,
    size: response.data.size || undefined,
  };
}
