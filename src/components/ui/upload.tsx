"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, File, X, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadProps {
  onFileSelect?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
  description?: string;
  maxSizeMb?: number;
}

interface UploadingFile {
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "success" | "error";
  previewUrl?: string;
}

export function Upload({
  onFileSelect,
  accept,
  multiple = false,
  className,
  description = "PNG, JPG, PDF (Maksimal 5MB)",
  maxSizeMb,
}: UploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [filesList, setFilesList] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    const previewUrl = isImage ? URL.createObjectURL(file) : undefined;

    const newUploading: UploadingFile = {
      name: file.name,
      size: file.size,
      progress: 0,
      status: "uploading",
      previewUrl,
    };

    setFilesList((prev) =>
      multiple ? [...prev, newUploading] : [newUploading],
    );

    // Simulate progress animation
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setFilesList((prev) =>
        prev.map((f) =>
          f.name === file.name
            ? {
                ...f,
                progress: currentProgress,
                status: currentProgress >= 100 ? "success" : "uploading",
              }
            : f,
        ),
      );

      if (currentProgress >= 100) {
        clearInterval(interval);
      }
    }, 150);
  };

  const handleFiles = (files: FileList) => {
    const selected: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (maxSizeMb && file.size > maxSizeMb * 1024 * 1024) continue;
      selected.push(file);
      simulateUpload(file);
    }
    if (selected.length > 0 && onFileSelect) {
      onFileSelect(selected);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = () => {
    setIsDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setFilesList((prev) => {
      const target = prev[index];
      if (target.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  return (
    <div className={cn("space-y-4 w-full", className)}>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 bg-muted/10 border-border hover:border-primary/50 hover:bg-primary/5",
          isDragActive && "border-primary bg-primary/5 scale-[0.99]",
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept={accept}
          multiple={multiple}
          className="hidden"
        />
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-bold">Pilih berkas atau seret ke sini</p>
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        </div>
      </div>

      {/* Uploading list */}
      {filesList.length > 0 && (
        <div className="space-y-2">
          {filesList.map((file, idx) => (
            <div
              key={file.name + idx}
              className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl text-xs font-semibold"
            >
              {file.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.previewUrl}
                  alt={file.name}
                  className="w-10 h-10 object-cover rounded-lg shrink-0 border border-border"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                  <File className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate text-foreground">
                  {file.name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {file.status === "uploading" && (
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-200"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {file.status === "uploading" ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-success" />
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  className="p-1 rounded bg-muted hover:bg-danger/10 hover:text-danger text-muted-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
