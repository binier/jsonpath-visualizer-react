import React from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon } from '../upload-icon';

export interface UploadJsonProps {
  onUpload(json: Record<string, any>): void;
  onError(error: any): void;
}

export default function ({ onUpload, onError }: UploadJsonProps) {
  const parseFiles = (files: FileList | File[] | null) => {
    if (!files || !files[0]) return;
    const file = files[0];

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        onUpload(json);
      } catch (error) {
        onError(error);
      }
    };

    reader.readAsText(file);
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: '.json,application/json',
    onDropAccepted: parseFiles,
  });

  return (
    <div {...getRootProps()} className="p-4 text-center text-gray-700 bg-gray-100 border border-dashed shadow cursor-pointer hover:bg-gray-200">
      <input {...getInputProps()} />
      <UploadIcon className="block w-12 m-auto" />
      <p className="mt-2">
        click or drag json file to this area to upload
      </p>
    </div>
  );
}
