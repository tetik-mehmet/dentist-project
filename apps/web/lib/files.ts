import api from './api';

export interface PatientFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  key: string;
  description?: string;
  patientId: string;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

export async function getFiles(patientId: string): Promise<PatientFile[]> {
  const res = await api.get<PatientFile[]>('/api/files', {
    params: { patientId },
  });
  return res.data;
}

export async function uploadFile(
  file: File,
  patientId: string,
  description?: string,
  onProgress?: (percent: number) => void,
): Promise<PatientFile> {
  const form = new FormData();
  form.append('file', file);
  form.append('patientId', patientId);
  if (description) form.append('description', description);

  const res = await api.post<PatientFile>('/api/files/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
  return res.data;
}

export async function deleteFile(id: string): Promise<void> {
  await api.delete(`/api/files/${id}`);
}

export function isImage(mimeType: string) {
  return mimeType.startsWith('image/');
}

export function isPdf(mimeType: string) {
  return mimeType === 'application/pdf';
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
