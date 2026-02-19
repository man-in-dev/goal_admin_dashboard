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
import { spotTestVideoSolutionApi, SpotTestVideoSolution } from '@/lib/api';
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
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function SpotTestVideoSolutionsPage() {
  const { toast } = useToast();
  const [solutions, setSolutions] = useState<SpotTestVideoSolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [operationLoading, setOperationLoading] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<SpotTestVideoSolution | null>(null);
  const [editingItem, setEditingItem] = useState<SpotTestVideoSolution | null>(null);
  const [viewingItem, setViewingItem] = useState<SpotTestVideoSolution | null>(null);
  const [formData, setFormData] = useState({
    testName: '',
    subject: '',
    videoLink: '',
    order: 0,
    isActive: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      const response = await spotTestVideoSolutionApi.getSpotTestVideoSolutions();
      if (response.success) {
        setSolutions(response.data.solutions || []);
      } else {
        toast({ title: 'Error', description: response.message || 'Failed to fetch solutions', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load solutions', variant: 'destructive' });
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

  const sortedSolutions = [...solutions].sort((a, b) => {
    if (!sortConfig) return 0;
    const aValue = a[sortConfig.key as keyof SpotTestVideoSolution];
    const bValue = b[sortConfig.key as keyof SpotTestVideoSolution];
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

  const filteredSolutions = sortedSolutions.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.testName.toLowerCase().includes(term) ||
      item.subject.toLowerCase().includes(term) ||
      (item.videoLink && item.videoLink.toLowerCase().includes(term))
    );
  });

  const resetForm = () => {
    setFormData({ testName: '', subject: '', videoLink: '', order: 0, isActive: true });
  };

  const handleCreate = async () => {
    try {
      setFormLoading(true);
      const response = await spotTestVideoSolutionApi.createSpotTestVideoSolution(formData);
      if (response.success) {
        toast({ title: 'Success', description: 'Spot Test video solution created successfully' });
        setIsCreateModalOpen(false);
        resetForm();
        fetchSolutions();
      } else {
        toast({ title: 'Error', description: response.message || 'Failed to create solution', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to create solution', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (item: SpotTestVideoSolution) => {
    setEditingItem(item);
    setFormData({
      testName: item.testName,
      subject: item.subject,
      videoLink: item.videoLink || '',
      order: item.order,
      isActive: item.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    try {
      setFormLoading(true);
      const response = await spotTestVideoSolutionApi.updateSpotTestVideoSolution(editingItem._id, formData);
      if (response.success) {
        toast({ title: 'Success', description: 'Spot Test video solution updated successfully' });
        setIsEditModalOpen(false);
        setEditingItem(null);
        resetForm();
        fetchSolutions();
      } else {
        toast({ title: 'Error', description: response.message || 'Failed to update solution', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update solution', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = (item: SpotTestVideoSolution) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      setOperationLoading(deletingItem._id);
      const response = await spotTestVideoSolutionApi.deleteSpotTestVideoSolution(deletingItem._id);
      if (response.success) {
        toast({ title: 'Success', description: 'Spot Test video solution deleted successfully' });
        setIsDeleteModalOpen(false);
        setDeletingItem(null);
        fetchSolutions();
      } else {
        toast({ title: 'Error', description: response.message || 'Failed to delete solution', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete solution', variant: 'destructive' });
    } finally {
      setOperationLoading(null);
    }
  };

  const handleView = (item: SpotTestVideoSolution) => {
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


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Video className="w-8 h-8 text-blue-600" />
            Spot Test Video Solutions
          </h1>
          <p className="text-gray-600 mt-1">
            Manage the Spot Test for NEET 2026 video solution table content
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreateModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Solution
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by test name, subject, or video link..."
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
            <div className="text-2xl font-bold text-gray-900">{solutions.length}</div>
            <p className="text-sm text-gray-500 mt-1">Total Entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {solutions.filter((s) => s.isActive).length}
            </div>
            <p className="text-sm text-gray-500 mt-1">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-400">
              {solutions.filter((s) => !s.isActive).length}
            </div>
            <p className="text-sm text-gray-500 mt-1">Inactive</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Spot Test Video Solutions ({filteredSolutions.length})</CardTitle>
          <CardDescription>
            Manage table content for the Spot Test for NEET 2026 video solution page
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredSolutions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? 'No results match your search' : 'No Spot Test video solutions found. Click "Add Solution" to create one.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader label="Order" sortKey="order" />
                    <SortableHeader label="Test Name" sortKey="testName" />
                    <SortableHeader label="Subject" sortKey="subject" />
                    <TableHead>Video Solution Link</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSolutions.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium text-gray-500">{item.order}</TableCell>
                      <TableCell className="font-semibold">{item.testName}</TableCell>
                      <TableCell>{item.subject}</TableCell>
                      <TableCell>
                        {item.videoLink ? (
                          <a
                            href={item.videoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800 flex items-center gap-1 font-medium"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Click Here
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">No link</span>
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
            <DialogTitle>Add Spot Test Video Solution</DialogTitle>
            <DialogDescription>Add a new entry to the Spot Test video solutions table</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="create-testName">Test Name *</Label>
              <Input
                id="create-testName"
                value={formData.testName}
                onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                placeholder="e.g., SPOT TEST-01"
              />
            </div>
            <div>
              <Label htmlFor="create-subject">Subject *</Label>
              <Input
                id="create-subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., PHYSICS"
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
            <Button onClick={handleCreate} disabled={formLoading || !formData.testName || !formData.subject}>
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
            <DialogTitle>Edit Spot Test Video Solution</DialogTitle>
            <DialogDescription>Update the selected video solution entry</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-testName">Test Name *</Label>
              <Input
                id="edit-testName"
                value={formData.testName}
                onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                placeholder="e.g., SPOT TEST-01"
              />
            </div>
            <div>
              <Label htmlFor="edit-subject">Subject *</Label>
              <Input
                id="edit-subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., PHYSICS"
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
            <Button onClick={handleUpdate} disabled={formLoading || !formData.testName || !formData.subject}>
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
            <DialogTitle>Spot Test Video Solution Details</DialogTitle>
            <DialogDescription>Full details of this entry</DialogDescription>
          </DialogHeader>
          {viewingItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">Test Name</Label>
                  <p className="text-sm font-semibold mt-1">{viewingItem.testName}</p>
                </div>
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
                    {viewingItem.videoLink}
                  </a>
                ) : (
                  <p className="text-sm text-gray-400 mt-1">No link provided</p>
                )}
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
            <DialogTitle>Delete Spot Test Video Solution</DialogTitle>
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
                <p className="font-semibold text-sm">{deletingItem.testName}</p>
                <p className="text-sm text-gray-600">{deletingItem.subject}</p>
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
