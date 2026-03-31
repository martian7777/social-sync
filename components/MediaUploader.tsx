'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Film } from 'lucide-react';
import { MediaFile } from '@/lib/types';
import styles from './MediaUploader.module.css';

interface MediaUploaderProps {
  files: MediaFile[];
  onChange: (files: MediaFile[]) => void;
  acceptVideosOnly?: boolean;
  acceptImagesOnly?: boolean;
}

export default function MediaUploader({
  files,
  onChange,
  acceptVideosOnly = false,
  acceptImagesOnly = false,
}: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = acceptVideosOnly
    ? 'video/*'
    : acceptImagesOnly
    ? 'image/*'
    : 'image/*,video/*';

  function handleFiles(rawFiles: FileList | null) {
    if (!rawFiles) return;
    const newFiles: MediaFile[] = Array.from(rawFiles).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
    }));
    onChange([...files, ...newFiles]);
  }

  function removeFile(id: string) {
    const file = files.find((f) => f.id === id);
    if (file) URL.revokeObjectURL(file.previewUrl);
    onChange(files.filter((f) => f.id !== id));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className={styles.uploader}>
      {/* Drop Zone */}
      <div
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        aria-label="Upload media files"
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className={styles.hiddenInput}
          onChange={(e) => handleFiles(e.target.files)}
          id="media-upload-input"
        />
        <div className={styles.dropContent}>
          <div className={styles.uploadIcon}>
            <Upload size={24} />
          </div>
          <p className={styles.dropText}>
            {acceptVideosOnly
              ? 'Drop videos here or click to browse'
              : acceptImagesOnly
              ? 'Drop images here or click to browse'
              : 'Drop images or videos here or click to browse'}
          </p>
          <p className={styles.dropSubtext}>
            {acceptVideosOnly ? 'MP4, MOV, AVI' : acceptImagesOnly ? 'JPG, PNG, GIF, WebP' : 'JPG, PNG, GIF, WebP, MP4, MOV'}
          </p>
        </div>
      </div>

      {/* Preview Grid */}
      {files.length > 0 && (
        <div className={styles.previewGrid}>
          {files.map((mf) => (
            <div key={mf.id} className={styles.previewItem}>
              {mf.type === 'image' ? (
                <img src={mf.previewUrl} alt={mf.file.name} className={styles.previewMedia} />
              ) : (
                <div className={styles.videoPreview}>
                  <Film size={28} className={styles.videoIcon} />
                  <span className={styles.videoName}>{mf.file.name}</span>
                </div>
              )}
              <div className={styles.mediaType}>
                {mf.type === 'image' ? <ImageIcon size={12} /> : <Film size={12} />}
              </div>
              <button
                className={styles.removeBtn}
                onClick={(e) => { e.stopPropagation(); removeFile(mf.id); }}
                aria-label={`Remove ${mf.file.name}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
