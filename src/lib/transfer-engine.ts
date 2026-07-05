// ============================================
// InfinityDrive — Transfer Engine
// ============================================
// Core Share→Copy→Delete pipeline with recursive folder support.
// Each file is processed independently — one failure doesn't abort the batch.

import type { drive_v3 } from 'googleapis';
import type { TransferResult } from '@/types';
import {
  shareFile,
  copyFile,
  deleteFile,
  createFolder,
  listFolderChildren,
  getFileMetadata,
} from './google-drive';

const FOLDER_MIME = 'application/vnd.google-apps.folder';

interface TransferParams {
  primaryDrive: drive_v3.Drive;
  secondaryDrive: drive_v3.Drive;
  secondaryEmail: string;
  fileIds: string[];
}

/**
 * Executes the Share→Copy→Delete transfer pipeline for a batch of files.
 * 
 * For each file:
 * 1. Share: Primary grants reader access to Secondary
 * 2. Copy: Secondary copies the file (creating an owned duplicate)
 * 3. Delete: Primary deletes the original
 * 
 * Folders are handled recursively — their structure is recreated
 * in the secondary account before children are transferred.
 */
export async function executeTransfer(
  params: TransferParams
): Promise<TransferResult[]> {
  const { primaryDrive, secondaryDrive, secondaryEmail, fileIds } = params;
  const results: TransferResult[] = [];

  for (const fileId of fileIds) {
    try {
      // Get file metadata to determine type
      const fileMeta = await getFileMetadata(primaryDrive, fileId);

      if (fileMeta.mimeType === FOLDER_MIME) {
        // Recursive folder transfer
        const folderResults = await transferFolder(
          primaryDrive,
          secondaryDrive,
          secondaryEmail,
          fileId,
          fileMeta.name
        );
        results.push(...folderResults);
      } else {
        // Single file transfer
        const result = await transferSingleFile(
          primaryDrive,
          secondaryDrive,
          secondaryEmail,
          fileId,
          fileMeta.name
        );
        results.push(result);
      }
    } catch (error) {
      // Catch-all for unexpected errors on a specific file
      results.push({
        fileId,
        fileName: fileId, // We might not have the name if metadata fetch failed
        status: 'FAILED',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
}

/**
 * Transfers a single file using the Share→Copy→Delete pipeline.
 */
async function transferSingleFile(
  primaryDrive: drive_v3.Drive,
  secondaryDrive: drive_v3.Drive,
  secondaryEmail: string,
  fileId: string,
  fileName: string,
  destinationFolderId?: string
): Promise<TransferResult> {
  try {
    // Step 1: Primary shares the file with the secondary account
    console.log(`[Transfer] Sharing "${fileName}" with ${secondaryEmail}...`);
    await shareFile(primaryDrive, fileId, secondaryEmail);

    // Step 2: Secondary copies the shared file (this creates an owned copy)
    console.log(`[Transfer] Copying "${fileName}" to secondary drive...`);
    const newFileId = await copyFile(
      secondaryDrive,
      fileId,
      fileName,
      destinationFolderId
    );

    // Step 3: Primary deletes the original file
    console.log(`[Transfer] Deleting original "${fileName}" from primary...`);
    await deleteFile(primaryDrive, fileId);

    console.log(`[Transfer] ✓ Successfully transferred "${fileName}"`);
    return {
      fileId,
      fileName,
      status: 'SUCCESS',
      newFileId,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Transfer] ✗ Failed to transfer "${fileName}":`, errorMsg);
    return {
      fileId,
      fileName,
      status: 'FAILED',
      error: errorMsg,
    };
  }
}

/**
 * Recursively transfers a folder and all its contents.
 * 
 * 1. Creates the folder structure in the secondary account
 * 2. Recursively transfers all children (files and subfolders)
 * 3. Deletes the original folder from primary
 */
async function transferFolder(
  primaryDrive: drive_v3.Drive,
  secondaryDrive: drive_v3.Drive,
  secondaryEmail: string,
  folderId: string,
  folderName: string,
  destinationParentId?: string
): Promise<TransferResult[]> {
  const results: TransferResult[] = [];

  try {
    // Step 1: Create the folder in the secondary account
    console.log(`[Transfer] Creating folder "${folderName}" in secondary...`);
    const newFolderId = await createFolder(
      secondaryDrive,
      folderName,
      destinationParentId
    );

    // Step 2: List all children of the original folder
    const children = await listFolderChildren(primaryDrive, folderId);
    console.log(
      `[Transfer] Found ${children.length} items in "${folderName}"`
    );

    // Step 3: Process each child
    for (const child of children) {
      if (child.mimeType === FOLDER_MIME) {
        // Recurse into subfolder
        const subResults = await transferFolder(
          primaryDrive,
          secondaryDrive,
          secondaryEmail,
          child.id,
          child.name,
          newFolderId
        );
        results.push(...subResults);
      } else {
        // Transfer individual file into the new folder
        const result = await transferSingleFile(
          primaryDrive,
          secondaryDrive,
          secondaryEmail,
          child.id,
          child.name,
          newFolderId
        );
        results.push(result);
      }
    }

    // Step 4: Delete the original folder from primary
    // (all children should already be deleted at this point)
    console.log(
      `[Transfer] Deleting original folder "${folderName}" from primary...`
    );
    await deleteFile(primaryDrive, folderId);

    // Record the folder itself as successfully transferred
    results.push({
      fileId: folderId,
      fileName: `📁 ${folderName}`,
      status: 'SUCCESS',
      newFileId: newFolderId,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(
      `[Transfer] ✗ Failed to transfer folder "${folderName}":`,
      errorMsg
    );
    results.push({
      fileId: folderId,
      fileName: `📁 ${folderName}`,
      status: 'FAILED',
      error: errorMsg,
    });
  }

  return results;
}
