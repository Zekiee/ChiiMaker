import React, { useState, useCallback, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  previewUrl: string | null;
  onImageUpload: (base64: string) => void;
  onImageRemove: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ previewUrl, onImageUpload, onImageRemove }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (files: FileList | null) => {
    if (files && files[0]) {
      try {
        const base64 = await fileToBase64(files[0]);
        onImageUpload(base64);
      } catch (error) {
        console.error("Error converting file to base64:", error);
        alert("图片转换失败，请重试！");
      }
    }
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const onUploaderClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">
        上传参考图 (可选)
      </label>
      
      <input 
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileChange(e.target.files)}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative w-full max-w-xs mx-auto group">
          <img src={previewUrl} alt="Image preview" className="w-full h-auto rounded-xl object-contain shadow-md border-4 border-white" />
          <button 
            onClick={onImageRemove}
            className="absolute -top-2 -right-2 bg-red-400 text-white rounded-full p-1.5 shadow-lg transition-transform transform hover:scale-110 opacity-80 group-hover:opacity-100"
            title="移除图片"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>
      ) : (
        <div 
          onClick={onUploaderClick}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          className={`
            w-full p-6 bg-chiikawa-bg rounded-2xl border-4 border-dashed cursor-pointer
            transition-all duration-300 ease-in-out text-center
            ${isDragging ? 'border-chiikawa-pink scale-105' : 'border-chiikawa-blue/20 hover:border-chiikawa-blue/50'}
          `}
        >
          <div className={`
            flex flex-col items-center justify-center text-chiikawa-text/60
            transition-all duration-300
            ${isDragging ? 'text-chiikawa-pink' : 'group-hover:text-chiikawa-blue'}
          `}>
            <UploadCloud size={32} className="mb-2" />
            <p className="font-bold">点击或拖拽上传图片</p>
            <p className="text-xs mt-1">让 AI 参考图片进行创作</p>
          </div>
        </div>
      )}
    </div>
  );
};