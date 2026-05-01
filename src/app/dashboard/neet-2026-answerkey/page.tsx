"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { neet2026AnswerKeyApi, Neet2026AnswerKey, uploadApi } from '@/lib/api';
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  Loader2,
  ExternalLink,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Video,
  FileText,
  X,
  Upload,
  Info,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { uploadFileToSpaces } from '@/lib/storage';

export default function Neet2026AnswerKeysPage() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<Neet2026AnswerKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [operationLoading, setOperationLoading] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Neet2026AnswerKey | null>(null);
  const [editingItem, setEditingItem] = useState<Neet2026AnswerKey | null>(null);
  const [viewingItem, setViewingItem] = useState<Neet2026AnswerKey | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    pdfLink: '',
    videoLink: '',
    order: 0,
    isActive: true,
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [masterKeyLoading, setMasterKeyLoading] = useState(false);
  const [isMasterUploadOpen, setIsMasterUploadOpen] = useState(false);
  const [masterUploadFile, setMasterUploadFile] = useState<File | null>(null);
  const [masterUploadError, setMasterUploadError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const response = await neet2026AnswerKeyApi.getNeet2026AnswerKeys();
      if (response.success) {
        setKeys(response.data.keys || []);
      } else {
        toast({ title: 'Error', description: response.message || 'Failed to fetch answer keys', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load answer keys', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedKeys = [...keys].sort((a, b) => {
    if (!sortConfig) return 0;
    const aValue = a[sortConfig.key as keyof Neet2026AnswerKey];
    const bValue = b[sortConfig.key as keyof Neet2026AnswerKey];
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  const filteredKeys = sortedKeys.filter((item) => {
    if (item.subject === 'NEET-2026 ANSWER KEY WITH QUESTION PAPER') return false;
    const term = searchTerm.toLowerCase();
    return (
      item.subject.toLowerCase().includes(term) ||
      (item.videoLink && item.videoLink.toLowerCase().includes(term))
    );
  });

  const resetForm = () => {
    setFormData({ subject: '', pdfLink: '', videoLink: '', order: 0, isActive: true });
    setPdfFile(null);
  };

  const handleCreate = async () => {
    try {
      setFormLoading(true);
      
      let finalPdfLink = formData.pdfLink;
      
      if (pdfFile) {
        const uploadedUrl = await uploadFileToSpaces(pdfFile);
        if (uploadedUrl) {
          finalPdfLink = uploadedUrl;
          // Register with PDF repository as requested
          try {
            await uploadApi.uploadPdf({
              name: `NEET 2026 Answer Key - ${formData.subject}`,
              url: uploadedUrl,
              filename: pdfFile.name,
              size: pdfFile.size
            });
          } catch (err) {
            console.error('Failed to register PDF in repository:', err);
            // We continue as the link is still valid for this entry
          }
        } else {
          toast({ title: 'Error', description: 'Failed to upload PDF', variant: 'destructive' });
          return;
        }
      }

      const response = await neet2026AnswerKeyApi.createNeet2026AnswerKey({
        ...formData,
        pdfLink: finalPdfLink
      });
      
      if (response.success) {
        toast({ title: 'Success', description: 'NEET 2026 Answer Key created successfully' });
        setIsCreateModalOpen(false);
        resetForm();
        fetchKeys();
      } else {
        toast({ title: 'Error', description: response.message || 'Failed to create answer key', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to create answer key', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (item: Neet2026AnswerKey) => {
    setEditingItem(item);
    setFormData({
      subject: item.subject,
      pdfLink: item.pdfLink || '',
      videoLink: item.videoLink || '',
      order: item.order,
      isActive: item.isActive,
    });
    setPdfFile(null);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    try {
      setFormLoading(true);
      
      let finalPdfLink = formData.pdfLink;
      
      if (pdfFile) {
        const uploadedUrl = await uploadFileToSpaces(pdfFile);
        if (uploadedUrl) {
          finalPdfLink = uploadedUrl;
          // Register with PDF repository as requested
          try {
            await uploadApi.uploadPdf({
              name: `NEET 2026 Answer Key - ${formData.subject}`,
              url: uploadedUrl,
              filename: pdfFile.name,
              size: pdfFile.size
            });
          } catch (err) {
            console.error('Failed to register PDF in repository:', err);
          }
        } else {
          toast({ title: 'Error', description: 'Failed to upload PDF', variant: 'destructive' });
          return;
        }
      }

      const response = await neet2026AnswerKeyApi.updateNeet2026AnswerKey(editingItem._id, {
        ...formData,
        pdfLink: finalPdfLink
      });
      
      if (response.success) {
        toast({ title: 'Success', description: 'NEET 2026 Answer Key updated successfully' });
        setIsEditModalOpen(false);
        setEditingItem(null);
        resetForm();
        fetchKeys();
      } else {
        toast({ title: 'Error', description: response.message || 'Failed to update answer key', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update answer key', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = (item: Neet2026AnswerKey) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      setOperationLoading(deletingItem._id);
      const response = await neet2026AnswerKeyApi.deleteNeet2026AnswerKey(deletingItem._id);
      if (response.success) {
        toast({ title: 'Success', description: 'NEET 2026 Answer Key deleted successfully' });
        setIsDeleteModalOpen(false);
        setDeletingItem(null);
        fetchKeys();
      } else {
        toast({ title: 'Error', description: response.message || 'Failed to delete answer key', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete answer key', variant: 'destructive' });
    } finally {
      setOperationLoading(null);
    }
  };

  const handleMasterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') {
      setMasterUploadError('Only PDF files are allowed');
      setMasterUploadFile(null);
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      setMasterUploadError('File size exceeds 50MB limit');
      setMasterUploadFile(null);
      return;
    }
    setMasterUploadError(null);
    setMasterUploadFile(selectedFile);
  };

  const handleMasterUploadConfirm = async () => {
    if (!masterUploadFile) return;

    try {
      setMasterKeyLoading(true);
      setMasterUploadError(null);

      // Step 1: Upload file to backend server storage (also registers in PDF library)
      const uploadedUrl = await uploadFileToSpaces(
        masterUploadFile,
        'NEET 2026 FULL ANSWER KEY & QUESTION PAPER'
      );

      if (!uploadedUrl) {
        setMasterUploadError('Failed to upload file. Please make sure the backend server is running and try again.');
        return;
      }

      // Step 2: Update or create the master answer key record
      const masterSubject = 'NEET-2026 ANSWER KEY WITH QUESTION PAPER';
      const existingMaster = keys.find((k) => k.subject === masterSubject);

      if (existingMaster) {
        await neet2026AnswerKeyApi.updateNeet2026AnswerKey(existingMaster._id, {
          pdfLink: uploadedUrl,
          isActive: true,
        });
      } else {
        await neet2026AnswerKeyApi.createNeet2026AnswerKey({
          subject: masterSubject,
          pdfLink: uploadedUrl,
          order: -1,
          isActive: true,
        });
      }

      toast({ title: 'Success', description: 'Master Answer Key uploaded and updated successfully!' });
      setIsMasterUploadOpen(false);
      setMasterUploadFile(null);
      fetchKeys();
    } catch (error: any) {
      console.error('Master upload error:', error);
      setMasterUploadError(error?.response?.data?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setMasterKeyLoading(false);
    }
  };

  const handleDeleteMasterPdf = async () => {
    const masterKey = keys.find(k => k.subject === "NEET-2026 ANSWER KEY WITH QUESTION PAPER");
    if (!masterKey) return;
    try {
      setMasterKeyLoading(true);
      const response = await neet2026AnswerKeyApi.deleteNeet2026AnswerKey(masterKey._id);
      if (response.success) {
        toast({ title: 'Success', description: 'Master PDF deleted successfully' });
        fetchKeys();
      } else {
        toast({ title: 'Error', description: response.message || 'Failed to delete Master PDF', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete Master PDF', variant: 'destructive' });
    } finally {
      setMasterKeyLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast({ title: 'Error', description: 'Only PDF files are allowed', variant: 'destructive' });
        return;
      }
      setPdfFile(selectedFile);
    }
  };

  const handleView = (item: Neet2026AnswerKey) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: string }) => (
    <TableHead className="cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort(sortKey)}>
      <div className="flex items-center gap-2">
        {label}
        <ArrowUpDown className="h-4 w-4 text-gray-400" />
      </div>
    </TableHead>
  );


  const masterKey = keys.find(k => k.subject === "NEET-2026 ANSWER KEY WITH QUESTION PAPER");

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Video className="w-8 h-8 text-blue-600" />
            NEET 2026 Answer Keys
          </h1>
          <p className="text-gray-600 mt-1">
            Manage the NEET 2026 Answer Key table content
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => { resetForm(); setIsCreateModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 h-11 px-6 shadow-lg shadow-blue-100 font-bold transition-all active:scale-95">
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Current Master PDF Box */}
      <Card className="border-blue-200 bg-blue-50/50 shadow-sm">
        <CardContent className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Master Question Paper & Answer Key</h3>
              <p className="text-sm text-gray-600">
                {masterKey?.pdfLink ? "This PDF is currently visible to students on the website." : "No master PDF uploaded yet. Students see 'Coming Soon'."}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Dialog open={isMasterUploadOpen} onOpenChange={(open) => { setIsMasterUploadOpen(open); if (!open) { setMasterUploadFile(null); setMasterUploadError(null); } }}>
              <Button
                onClick={() => setIsMasterUploadOpen(true)}
                disabled={masterKeyLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-4 rounded-lg shadow-sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                {masterKey?.pdfLink ? 'Replace PDF' : 'Upload PDF'}
              </Button>
              <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-3xl overflow-hidden p-0">
                <div className="bg-blue-600 p-8 text-white relative">
                  <DialogHeader className="text-left">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                      <Upload className="h-6 w-6" />
                      Upload Master PDF
                    </DialogTitle>
                    <DialogDescription className="text-blue-100 mt-2 font-medium">
                      Upload the official NEET 2026 question paper &amp; answer key. This will immediately activate the &quot;Download Now&quot; button on the student portal.
                    </DialogDescription>
                  </DialogHeader>
                  <Upload className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10 rotate-12" />
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700">Master PDF File *</Label>
                    {!masterUploadFile ? (
                      <div
                        className={`group border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-blue-50/50 hover:border-blue-400 ${masterUploadError ? 'border-red-200' : 'border-gray-200'}`}
                        onClick={() => document.getElementById('master-pdf-file')?.click()}
                      >
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                          <Upload className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-bold text-gray-900">Click to Select PDF</p>
                        <p className="text-xs text-gray-500 mt-1">PDF only · Max 50MB</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate pr-4">{masterUploadFile.name}</p>
                            <p className="text-[10px] text-gray-500">{(masterUploadFile.size / (1024 * 1024)).toFixed(2)} MB · PDF</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setMasterUploadFile(null)} className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <input
                      id="master-pdf-file"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleMasterFileChange}
                      disabled={masterKeyLoading}
                    />
                  </div>
                  {masterUploadError && (
                    <div className="p-3 bg-red-50 text-red-700 text-[11px] font-bold rounded-xl border border-red-100 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-600 flex-shrink-0" />
                      {masterUploadError}
                    </div>
                  )}
                </div>
                <DialogFooter className="p-8 pt-0 flex gap-3">
                  <Button
                    variant="outline"
                    className="h-12 px-6 rounded-xl border-gray-200 font-bold text-gray-600"
                    onClick={() => { setIsMasterUploadOpen(false); setMasterUploadFile(null); setMasterUploadError(null); }}
                    disabled={masterKeyLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
                    onClick={handleMasterUploadConfirm}
                    disabled={!masterUploadFile || masterKeyLoading}
                  >
                    {masterKeyLoading ? (
                      <><Loader2 className="h-5 w-5 animate-spin mr-2" />Uploading...</>
                    ) : (
                      'Confirm & Upload'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {masterKey?.pdfLink && (
              <>
                <a
                  href={masterKey.pdfLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-bold text-sm shadow-sm"
                >
                  <Eye className="h-4 w-4" />
                  View
                </a>
                <Button
                  variant="destructive"
                  onClick={handleDeleteMasterPdf}
                  disabled={masterKeyLoading}
                  className="h-10 px-4 font-bold shadow-sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by subject or video link..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{keys.length}</div>
            <p className="text-sm text-gray-500 mt-1">Total Entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {keys.filter((s) => s.isActive).length}
            </div>
            <p className="text-sm text-gray-500 mt-1">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-400">
              {keys.filter((s) => !s.isActive).length}
            </div>
            <p className="text-sm text-gray-500 mt-1">Inactive</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>NEET 2026 Answer Keys ({filteredKeys.length})</CardTitle>
          <CardDescription>
            Manage table content for the NEET 2026 video solution page
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredKeys.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? 'No results match your search' : 'No NEET 2026 answer keys found. Click "Add Answer Key" to create one.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader label="Order" sortKey="order" />
                    <SortableHeader label="Subject" sortKey="subject" />
                    <TableHead>Video Solution Link</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKeys.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium text-gray-500">{item.order}</TableCell>
                      <TableCell className="font-semibold">{item.subject}</TableCell>
                      <TableCell>
                        {item.videoLink ? (
                          <a
                            href={item.videoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800 flex items-center gap-1 font-medium text-xs"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Watch Video
                          </a>
                        ) : (
                          <span className="text-gray-400 text-[10px]">No Video link</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.isActive ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleView(item)} title="View details">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} title="Edit">
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => confirmDelete(item)}
                            disabled={operationLoading === item._id}
                            title="Delete"
                          >
                            {operationLoading === item._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-500" />
                            )}
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
      </Card>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add NEET 2026 Answer Key</DialogTitle>
            <DialogDescription>Add a new entry to the NEET 2026 answer keys table</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="create-subject">Subject *</Label>
              <Input
                id="create-subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., BIOLOGY"
              />
            </div>
            <div>
              <Label htmlFor="create-videoLink">Video Solution Link</Label>
              <Input
                id="create-videoLink"
                value={formData.videoLink}
                onChange={(e) => setFormData({ ...formData, videoLink: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                type="url"
              />
            </div>
            <div>
              <Label htmlFor="create-order">Display Order</Label>
              <Input
                id="create-order"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                type="number"
                min="0"
                placeholder="0"
              />
              <p className="text-sm text-gray-500 mt-1">Lower numbers appear first in the table</p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="create-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="create-isActive">Active (visible on website)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateModalOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={formLoading || !formData.subject}>
              {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit NEET 2026 Answer Key</DialogTitle>
            <DialogDescription>Update the selected answer key entry</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-subject">Subject *</Label>
              <Input
                id="edit-subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., BIOLOGY"
              />
            </div>
            <div>
              <Label htmlFor="edit-videoLink">Video Solution Link</Label>
              <Input
                id="edit-videoLink"
                value={formData.videoLink}
                onChange={(e) => setFormData({ ...formData, videoLink: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                type="url"
              />
            </div>
            <div>
              <Label htmlFor="edit-order">Display Order</Label>
              <Input
                id="edit-order"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                type="number"
                min="0"
                placeholder="0"
              />
              <p className="text-sm text-gray-500 mt-1">Lower numbers appear first in the table</p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="edit-isActive">Active (visible on website)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setIsEditModalOpen(false); setEditingItem(null); resetForm(); }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={formLoading || !formData.subject}>
              {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>NEET 2026 Answer Key Details</DialogTitle>
            <DialogDescription>Full details of this entry</DialogDescription>
          </DialogHeader>
          {viewingItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">Subject</Label>
                  <p className="text-sm font-semibold mt-1">{viewingItem.subject}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">Display Order</Label>
                  <p className="text-sm font-semibold mt-1">{viewingItem.order}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">Status</Label>
                  <div className="mt-1">
                    {viewingItem.isActive ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" />Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">Video Solution Link</Label>
                  {viewingItem.videoLink ? (
                    <a
                      href={viewingItem.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm mt-1 break-all"
                    >
                      <ExternalLink className="h-4 w-4 flex-shrink-0" />
                      Video Link
                    </a>
                  ) : (
                    <p className="text-sm text-gray-400 mt-1">No video link</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">Created At</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(viewingItem.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">Last Updated</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(viewingItem.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            {viewingItem && (
              <Button onClick={() => { setIsViewModalOpen(false); handleEdit(viewingItem); }}>
                <Edit className="h-4 w-4 mr-2" />Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete NEET 2026 Answer Key</DialogTitle>
            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingItem && (
            <div className="py-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete the entry:
              </p>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                <p className="font-semibold text-sm">{deletingItem.subject}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setIsDeleteModalOpen(false); setDeletingItem(null); }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!!operationLoading}
            >
              {operationLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
