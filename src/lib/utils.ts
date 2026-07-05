// ============================================
// InfinityDrive — Formatting Utilities
// ============================================

/**
 * Formats bytes into a human-readable string (KB, MB, GB, TB).
 */
export function formatBytes(bytes: number | string | null | undefined): string {
  if (bytes === null || bytes === undefined) return '—';
  
  const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(num) || num === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(num) / Math.log(k));
  const value = num / Math.pow(k, i);

  return `${value.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

/**
 * Formats a date string into a relative or short date format.
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '—';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes}m ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Returns a Lucide icon name based on the file's MIME type.
 */
export function getFileIconName(mimeType: string): string {
  if (mimeType === 'application/vnd.google-apps.folder') return 'Folder';
  if (mimeType.startsWith('image/')) return 'Image';
  if (mimeType.startsWith('video/')) return 'Video';
  if (mimeType.startsWith('audio/')) return 'Music';
  if (mimeType.includes('pdf')) return 'FileText';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Sheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'Presentation';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'FileText';
  if (mimeType.includes('zip') || mimeType.includes('compressed') || mimeType.includes('archive')) return 'Archive';
  if (mimeType.includes('text') || mimeType.includes('json') || mimeType.includes('xml')) return 'FileCode';
  return 'File';
}

/**
 * Calculates storage percentage and determines warning level.
 */
export function getStorageStatus(usage: number, limit: number) {
  const percentage = limit > 0 ? (usage / limit) * 100 : 0;
  return {
    percentage: Math.min(percentage, 100),
    isWarning: percentage >= 75,
    isCritical: percentage >= 90,
    isFull: percentage >= 99,
  };
}

/**
 * Generates a consistent color for an email address (for avatars).
 */
export function emailToColor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 60%, 50%)`;
}

/**
 * Checks if a MIME type represents a Google Apps file (Docs, Sheets, etc.)
 * These files don't consume storage quota.
 */
export function isGoogleAppsFile(mimeType: string): boolean {
  return mimeType.startsWith('application/vnd.google-apps.');
}

/**
 * Checks if a MIME type is a folder.
 */
export function isFolder(mimeType: string): boolean {
  return mimeType === 'application/vnd.google-apps.folder';
}
