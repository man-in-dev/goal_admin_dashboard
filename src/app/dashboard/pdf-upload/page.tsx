"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadApi } from '@/lib/api';
import { FileText, Copy, Check, Upload, X, Loader2 } from 'lucide-react';

export default function PdfUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        setFile(null);
        return;
      }
      if (selectedFile.size > 24 * 1024 * 1024) {
        setError('File size exceeds 24MB limit');
        setFile(null);
        return;
      }
      setError(null);
      setFile(selectedFile);
      setUploadedUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      const response = await uploadApi.uploadPdf(file);
      if (response.success) {
        setUploadedUrl(response.data.url);
        setFile(null);
      } else {
        setError(response.message || 'Failed to upload PDF');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (uploadedUrl) {
      navigator.clipboard.writeText(uploadedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetAll = () => {
    setFile(null);
    setUploadedUrl(null);
    setError(null);
    setUploading(false);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">PDF Upload</h1>
          <p className="text-gray-600 mt-1">Easily upload and get direct links for your PDF assets</p>
        </div>
        {(file || uploadedUrl) && (
          <Button variant="outline" size="sm" onClick={resetAll} className="w-fit text-gray-500 hover:text-red-600 transition-colors">
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Upload New PDF
            </CardTitle>
            <CardDescription>File will be stored securely and you'll get a permanent URL</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {!file && !uploadedUrl && (
                <div 
                  className={`group relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer bg-gray-50/50 hover:bg-blue-50/30 hover:border-blue-300 ${error ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}
                  onClick={() => document.getElementById('pdf-file')?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-blue-400', 'bg-blue-50/50');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50/50');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50/50');
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      const event = { target: { files: e.dataTransfer.files } } as any;
                      handleFileChange(event);
                    }
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <Upload className="h-8 w-8" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-1">Select a PDF to upload</p>
                    <p className="text-sm text-gray-500">Drag and drop or click to browse (Max 24MB)</p>
                  </div>
                </div>
              )}

              {file && (
                <div className="flex items-center justify-between p-5 bg-blue-50/50 border border-blue-100 rounded-2xl transition-all animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 truncate max-w-[280px]" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 bg-blue-100/50 w-fit px-2 py-0.5 rounded-full mt-0.5">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setFile(null)}
                    disabled={uploading}
                    className="h-10 w-10 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              )}

              <Input
                id="pdf-file"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl flex items-center gap-2 animate-shake">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  {error}
                </div>
              )}

              {file && !uploadedUrl && (
                <Button 
                  className="w-full h-14 text-white font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200 transition-all hover:translate-y-[-1px] active:translate-y-0"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Uploading to server...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Begin Upload
                    </>
                  )}
                </Button>
              )}
            </div>

            {uploadedUrl && (
              <div className="pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-2 text-green-600 font-bold mb-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-5 w-5" />
                  </div>
                  <span>PDF Uploaded Successfully!</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block ml-1">Shareable Document URL</Label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1 group">
                        <Input
                          value={uploadedUrl}
                          readOnly
                          className="bg-gray-50 border-gray-200 h-14 pl-4 pr-4 font-mono text-sm text-gray-600 focus-visible:ring-blue-500"
                        />
                      </div>
                      <Button 
                        onClick={copyToClipboard}
                        className={`h-14 px-8 font-bold transition-all duration-300 ${copied ? 'bg-green-600 border-green-600 hover:bg-green-700' : 'bg-gray-900 border-gray-900 hover:bg-black'}`}
                      >
                        {copied ? (
                          <>
                            <Check className="mr-2 h-5 w-5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-5 w-5" />
                            Copy Link
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100/50">
                    <p className="text-sm text-orange-800 flex items-start gap-3">
                      <span className="text-lg">💡</span>
                      Use this link in your Banners, Blogs, or News & Events to provide direct document downloads for students.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gray-50/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FileText className="h-24 w-24" />
          </div>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Usage Guide</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">1</div>
              <h4 className="font-semibold text-gray-900">Choose File</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Select any PDF document from your device. Keep it under 24MB for optimal performance.</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">2</div>
              <h4 className="font-semibold text-gray-900">Upload</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Click upload button. We will store it securely on our servers.</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">3</div>
              <h4 className="font-semibold text-gray-900">Get Link</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Copy the generated URL and use it anywhere you need a direct PDF link.</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}
