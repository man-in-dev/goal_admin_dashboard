"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { uploadToCloudinary } from '@/lib/cloudinary';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  onAltChange?: (alt: string) => void;
  altValue?: string;
  label?: string;
  required?: boolean;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
  preview?: boolean;
  requiredDimensions?: {
    width: number;
    height: number;
    label: string;
  };
}

export function ImageUpload({
  value,
  onChange,
  onAltChange,
  altValue = '',
  label = 'Image',
  required = false,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  className = '',
  preview = true,
  requiredDimensions
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImageDimensions = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        if (requiredDimensions) {
          const { width, height, label } = requiredDimensions;
          const isValid = img.width === width && img.height === height;
          
          if (!isValid) {
            toast({
              title: "Invalid image dimensions",
              description: `${label} image must be exactly ${width}x${height} pixels. Current dimensions: ${img.width}x${img.height}`,
              variant: "destructive",
            });
            resolve(false);
            return;
          }
        }
        resolve(true);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        toast({
          title: "Invalid image file",
          description: "Could not load the image. Please try a different file.",
          variant: "destructive",
        });
        resolve(false);
      };
      
      img.src = url;
    });
  };

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `Please select a valid image file (${acceptedTypes.join(', ')}).`,
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Please select an image smaller than ${maxSize}MB.`,
        variant: "destructive",
      });
      return;
    }

    // Validate dimensions if required
    if (requiredDimensions) {
      const isValidDimensions = await validateImageDimensions(file);
      if (!isValidDimensions) {
        return;
      }
    }

    setIsUploading(true);

    try {
      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(file);
      
      if (cloudinaryUrl) {
        setPreviewUrl(cloudinaryUrl);
        onChange(cloudinaryUrl);
        
        // Auto-generate alt text from filename
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        onAltChange?.(fileName);
        
        toast({
          title: "Image uploaded successfully",
          description: "Your image has been uploaded to Cloudinary and is ready to use.",
        });
      } else {
        throw new Error('Failed to upload to Cloudinary');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image to Cloudinary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onChange('');
    onAltChange?.('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="image-upload">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${value ? 'border-green-500 bg-green-50' : ''}
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isUploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600">Uploading image...</p>
          </div>
        ) : previewUrl || value ? (
          <div className="space-y-4">
            {preview && (
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={previewUrl || value}
                    alt="Preview"
                    className="max-h-32 max-w-full rounded-lg shadow-sm"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <p className="text-sm text-green-600 font-medium">
                ✓ Image uploaded successfully
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBrowseClick}
              >
                <Upload className="h-4 w-4 mr-2" />
                Change Image
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">
                Drop your image here, or{' '}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 underline"
                  onClick={handleBrowseClick}
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500">
                Supports: {acceptedTypes.join(', ')} • Max size: {maxSize}MB
                {requiredDimensions && (
                  <span className="block mt-1 text-orange-600">
                    Required dimensions: {requiredDimensions.width}x{requiredDimensions.height} pixels
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Alt Text Input */}
      <div className="space-y-1">
        <Label htmlFor="image-alt" className="text-sm">
          Alt Text (for accessibility)
        </Label>
        <Input
          id="image-alt"
          value={altValue}
          onChange={(e) => onAltChange?.(e.target.value)}
          placeholder="Describe the image for accessibility"
          className="text-sm"
        />
        <p className="text-xs text-gray-500">
          This text will be read by screen readers to describe the image
        </p>
      </div>

      {/* URL Input (Alternative to file upload) */}
      {/* <div className="space-y-1">
        <Label htmlFor="image-url" className="text-sm">
          Image URL
        </Label>
        <Input
          id="image-url"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (e.target.value) {
              setPreviewUrl(e.target.value);
            } else {
              setPreviewUrl(null);
            }
          }}
          placeholder="https://example.com/image.jpg"
          className="text-sm"
        />
      </div> */}
    </div>
  );
}
