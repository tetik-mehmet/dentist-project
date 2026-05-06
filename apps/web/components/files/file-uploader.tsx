'use client';

import { useState, useRef, DragEvent } from 'react';
import { UploadCloud, X, FileText, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadFile, PatientFile, isImage, isPdf, formatBytes } from '@/lib/files';

interface Props {
  patientId: string;
  onUploaded: (file: PatientFile) => void;
}

export function FileUploader({ patientId, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    const MAX = 20 * 1024 * 1024;
    if (file.size > MAX) {
      setError('Dosya boyutu 20 MB\'ı geçemez');
      return;
    }
    setError(null);
    setUploading(true);
    setProgress(0);
    try {
      const uploaded = await uploadFile(file, patientId, undefined, setProgress);
      onUploaded(uploaded);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Yükleme başarısız');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <UploadCloud
          size={32}
          className={`mx-auto mb-2 ${dragging ? 'text-blue-500' : 'text-gray-400'}`}
        />
        {uploading ? (
          <div>
            <p className="text-sm text-gray-600 mb-2">Yükleniyor... %{progress}</p>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mx-auto max-w-xs">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700">
              Dosyayı buraya sürükleyin veya tıklayın
            </p>
            <p className="text-xs text-gray-400 mt-1">
              JPEG, PNG, WEBP, PDF — Maks 20 MB
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
          <X size={12} /> {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}
