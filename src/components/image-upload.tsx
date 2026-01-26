"use client";

import React, { useRef, useState } from "react";
import { upload } from "@imagekit/next";
import { Button } from "@/components/ui/button";
import { Loader2, X, ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  folder?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  folder = "/dishes",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const authenticator = async () => {
    try {
      const response = await fetch("/api/imagekit/auth");
      if (!response.ok) {
        throw new Error("Failed to get authentication parameters");
      }
      return await response.json();
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const authParams = await authenticator();
      const response = await upload({
        file,
        fileName: file.name,
        publicKey: process.env.NEXT_PUBLIC_IK_PUBLIC_KEY as string,
        ...authParams,
        folder,
      });

      if (response && response.url) {
        onChange(response.url);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative w-40 h-40 rounded-md overflow-hidden border">
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={onRemove}
                variant="destructive"
                size="icon"
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Image
              fill
              className="object-cover"
              alt="Uploaded image"
              src={value}
            />
          </div>
        ) : (
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`w-40 h-40 rounded-md border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 transition ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isUploading ? (
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            ) : (
              <>
                <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground font-medium">
                  Upload Image
                </span>
              </>
            )}
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden"
          accept="image/*"
        />
      </div>
    </div>
  );
}
