"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { uploadApi } from '@/lib/api';
import { FileText, Copy, Check, Upload, X, Loader2, Trash2, Search, ExternalLink, Plus } from 'lucide-react';

export default function PdfUploadPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [docName, setDocName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // For PDF list
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [operationLoading, setOperationLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    try {
      setLoading(true);
      const response = await uploadApi.getPdfs({ page: 1, limit: 100 });
      if (response.success) {
        setPdfs(response.data.pdfs || []);
      }
    } catch (err) {
      console.error('Failed to fetch PDFs:', err);
    } finally {
      setLoading(false);
    }
  };

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
      if (!docName) {
        setDocName(selectedFile.name.split('.').slice(0, -1).join('.').replace(/[^a-zA-Z0-9]/g, ' '));
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !docName) {
      setError('Please provide both document name and file');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const response = await uploadApi.uploadPdf(file, docName);
      if (response.success) {
        setFile(null);
        setDocName('');
        setIsDialogOpen(false);
        fetchPdfs(); // Refresh list
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

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      setOperationLoading(id);
      const response = await uploadApi.deletePdf(id);
      if (response.success) {
        fetchPdfs();
      } else {
        alert('Failed to delete PDF');
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setOperationLoading(null);
    }
  };

  const filteredPdfs = pdfs.filter(pdf => 
    pdf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pdf.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">PDF Document Repository</h1>
          <p className="text-gray-600 mt-1">Manage all public and private PDF assets in one place</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 h-11 px-6 font-bold shadow-lg shadow-blue-100 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-3xl overflow-hidden p-0">
            <div className="bg-blue-600 p-8 text-white relative">
              <DialogHeader className="text-left">
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                   <Upload className="h-6 w-6" />
                   New PDF Asset
                </DialogTitle>
                <DialogDescription className="text-blue-100 mt-2 font-medium">
                  Fill in the name and select a file to store it in our secure cloud storage.
                </DialogDescription>
              </DialogHeader>
              <Upload className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10 rotate-12" />
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doc-name" className="text-sm font-bold text-gray-700">Document Title *</Label>
                  <Input 
                    id="doc-name"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="e.g., Annual Report 2024"
                    className="h-12 border-gray-200 focus:ring-blue-500 rounded-xl"
                  />
                  <p className="text-[10px] text-gray-400 font-medium ml-1">THIS TITLE WILL BE USED AS THE PRIMARY IDENTIFIER.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">PDF Document *</Label>
                  {!file ? (
                    <div 
                      className={`group border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-blue-50/50 hover:border-blue-400 ${error ? 'border-red-200' : 'border-gray-200'}`}
                      onClick={() => document.getElementById('pdf-file')?.click()}
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold text-gray-900">Select Document</p>
                      <p className="text-xs text-gray-500 mt-1">PDF only, Max 24MB</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate pr-4">{file.name}</p>
                          <p className="text-[10px] text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB • PDF</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <input
                    id="pdf-file"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-[11px] font-bold rounded-xl border border-red-100 animate-in fade-in flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-600" />
                  {error}
                </div>
              )}
            </div>

            <DialogFooter className="p-8 pt-0 flex gap-3">
              <Button variant="outline" className="h-12 px-6 rounded-xl border-gray-200 font-bold text-gray-600" onClick={() => setIsDialogOpen(false)} disabled={uploading}>
                Cancel
              </Button>
              <Button 
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
                onClick={handleUpload}
                disabled={!file || !docName || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  'Confirm & Upload'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-premium bg-white min-h-[500px] overflow-hidden rounded-3xl">
          <CardHeader className="p-8 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-50">
            <div>
              <CardTitle className="text-xl font-bold">Available Documents</CardTitle>
              <CardDescription className="mt-1">Manage links and files for your portal content</CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search by name or filename..." 
                className="pl-11 h-12 border-gray-100 bg-gray-50/50 rounded-xl focus:ring-blue-500 focus:bg-white transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-400 uppercase tracking-widest text-xs font-bold">Syncing Database...</p>
              </div>
            ) : filteredPdfs.length === 0 ? (
              <div className="text-center py-32">
                <div className="w-16 h-16 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8" />
                </div>
                <p className="text-gray-400 font-bold italic">No documents found in your library</p>
                <p className="text-gray-300 text-xs mt-1">Try uploading a new document or clearing search filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50/80">
                    <TableRow className="border-none hover:bg-transparent">
                      <TableHead className="py-4 pl-8 uppercase text-[10px] font-black text-gray-400 tracking-widest">Doc Information</TableHead>
                      <TableHead className="py-4 uppercase text-[10px] font-black text-gray-400 tracking-widest">Properties</TableHead>
                      <TableHead className="py-4 uppercase text-[10px] font-black text-gray-400 tracking-widest">Added Date</TableHead>
                      <TableHead className="py-4 pr-8 text-right uppercase text-[10px] font-black text-gray-400 tracking-widest">Asset Management</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPdfs.map((pdf) => (
                      <TableRow key={pdf._id} className="border-b border-gray-50 hover:bg-blue-50/20 transition-all group">
                        <TableCell className="py-5 pl-8">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100/50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 truncate max-w-[280px] text-sm group-hover:text-blue-700 transition-colors uppercase tracking-tight">{pdf.name}</p>
                              <p className="text-[11px] text-gray-400 font-medium truncate max-w-[220px] font-mono">{pdf.filename}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="flex flex-col gap-0.5">
                             <div className="flex items-center gap-2">
                               <div className="w-1 h-1 bg-gray-400 rounded-full" />
                               <span className="text-[11px] text-gray-500 font-bold">{(pdf.size / (1024 * 1024)).toFixed(2)} MB</span>
                             </div>
                             <div className="flex items-center gap-2">
                               <div className="w-1 h-1 bg-gray-400 rounded-full" />
                               <span className="text-[11px] text-gray-500 font-bold uppercase tracking-tighter">Document/PDF</span>
                             </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <p className="text-[11px] font-bold text-gray-500">{new Date(pdf.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          <p className="text-[10px] font-medium text-gray-300 uppercase">{new Date(pdf.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </TableCell>
                        <TableCell className="py-5 pr-8">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-10 px-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-bold gap-2 text-xs"
                              onClick={() => window.open(pdf.url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span className="hidden sm:inline">View</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-10 px-3 rounded-xl transition-all font-bold gap-2 text-xs ${copiedId === pdf._id ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                              onClick={() => copyToClipboard(pdf.url, pdf._id)}
                            >
                              {copiedId === pdf._id ? (
                                <>
                                  <Check className="h-4 w-4" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4" />
                                  <span className="hidden sm:inline">Copy Link</span>
                                </>
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              onClick={() => handleDelete(pdf._id)}
                              disabled={operationLoading === pdf._id}
                            >
                              {operationLoading === pdf._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sync Status: Real-time Cloud Storage</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Assets: {filteredPdfs.length}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
