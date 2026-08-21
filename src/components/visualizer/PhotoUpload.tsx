'use client';

import { Camera, Upload } from 'lucide-react';
import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { config, isAcceptedImageType } from '@/lib/config';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
  onSelect: (file: File) => void;
}

export function PhotoUpload({ onSelect }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndSelect = (file: File) => {
    setError(null);
    if (!isAcceptedImageType(file.type)) {
      setError('Gebruik JPG, PNG of WEBP.');
      return;
    }
    if (file.size > config.maxImageSizeBytes) {
      setError('De foto mag maximaal 10 MB zijn.');
      return;
    }
    onSelect(file);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) validateAndSelect(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) validateAndSelect(file);
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'cursor-pointer rounded-2xl border-2 border-dashed bg-white p-8 sm:p-12 text-center transition-all',
          isDragging ? 'border-stone-500 bg-stone-50' : 'border-stone-200 hover:border-stone-300',
        )}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
          <Camera className="h-8 w-8 text-stone-600" />
        </div>
        <p className="text-lg font-medium text-stone-900">Upload jouw keukenfoto</p>
        <p className="mt-2 text-sm text-stone-500">
          Maak een foto of kies er één uit je bibliotheek
        </p>
        <Button
          type="button"
          className="mt-6"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          <Upload className="h-4 w-4" />
          Foto kiezen
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          capture="environment"
          className="hidden"
          onChange={handleChange}
        />
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
