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
import { reNeetVideoSolutionApi, ReNeetVideoSolution } from '@/lib/api';
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
  XCircle
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function ReNeetVideoSolutionsPage() {
  const { toast } = useToast();
  const [solutions, setSolutions] = useState<ReNeetVideoSolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [operationLoading, setOperationLoading] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ReNeetVideoSolution | null>(null);
  const [viewingItem, setViewingItem] = useState<ReNeetVideoSolution | null>(null);
  const [formData, setFormData] = useState({
    testName: '',
    subject: '',
    videoLink: '',
    order: 1,
    isActive: true
  });
  const [formLoading, setFormLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      const response = await reNeetVideoSolutionApi.getReNeetVideoSolutions();
      
      if (response.success) {
        setSolutions(response.data.solutions || []);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch solutions",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching solutions:', error);
      toast({
        title: "Error",
        description: "Failed to load solutions",
        variant: "destructive"
      });
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
    
    const aValue = a[sortConfig.key as keyof ReNeetVideoSolution];
    const bValue = b[sortConfig.key as keyof ReNeetVideoSolution];
    
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    }
    
    return 0;
  });

  const filteredSolutions = sortedSolutions.filter(item => {
    const matchesSearch = 
      item.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.videoLink && item.videoLink.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const resetForm = () => {
    setFormData({
      testName: '',
      subject: '',
      videoLink: '',
      order: 1,
      isActive: true
    });
  };

  const handleCreate = async () => {
    try {
      setFormLoading(true);
      const response = await reNeetVideoSolutionApi.createReNeetVideoSolution(formData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "RE-NEET video solution created successfully"
        });
        setIsCreateModalOpen(false);
        resetForm();
        fetchSolutions();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create solution",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating solution:', error);
      toast({
        title: "Error",
        description: "Failed to create solution",
        variant: "destructive"
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (item: ReNeetVideoSolution) => {
    setEditingItem(item);
    setFormData({
      testName: item.testName,
      subject: item.subject,
      videoLink: item.videoLink || '',
      order: item.order,
      isActive: item.isActive
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    
    try {
      setFormLoading(true);
      const response = await reNeetVideoSolutionApi.updateReNeetVideoSolution(editingItem._id, formData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "RE-NEET video solution updated successfully"
        });
        setIsEditModalOpen(false);
        setEditingItem(null);
        resetForm();
        fetchSolutions();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update solution",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating solution:', error);
      toast({
        title: "Error",
        description: "Failed to update solution",
        variant: "destructive"
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this RE-NEET video solution?')) return;
    
    try {
      setOperationLoading(id);
      const response = await reNeetVideoSolutionApi.deleteReNeetVideoSolution(id);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "RE-NEET video solution deleted successfully"
        });
        fetchSolutions();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete solution",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting solution:', error);
      toast({
        title: "Error",
        description: "Failed to delete solution",
        variant: "destructive"
      });
    } finally {
      setOperationLoading(null);
    }
  };

  const handleView = (item: ReNeetVideoSolution) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: string }) => (
    <TableHead 
      className="cursor-pointer hover:bg-gray-100 select-none"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {label}
        <ArrowUpDown className="h-4 w-4 text-gray-400" />
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RE-NEET Video Solutions</h1>
          <p className="text-gray-600 mt-1">Manage RE-NEET 2026 Test Series video solution table content</p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreateModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Solution
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by test name, subject, or video link..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>RE-NEET Video Solutions ({filteredSolutions.length})</CardTitle>
          <CardDescription>
            Manage table content for /student-zone/re-neet-2026-test-series-video-solution page
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredSolutions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No RE-NEET video solutions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">S.NO</TableHead>
                    <SortableHeader label="Test Name" sortKey="testName" />
                    <SortableHeader label="Subject" sortKey="subject" />
                    <TableHead>Video Link</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSolutions.map((item, index) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{item.testName}</TableCell>
                      <TableCell>{item.subject}</TableCell>
                      <TableCell>
                        {item.videoLink ? (
                          <a
                            href={item.videoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View Link
                          </a>
                        ) : (
                          <span className="text-gray-400">No link</span>
                        )}
                      </TableCell>
                      <TableCell>{item.order}</TableCell>
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
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(item)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item._id)}
                            disabled={operationLoading === item._id}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create RE-NEET Video Solution</DialogTitle>
            <DialogDescription>
              Add a new entry to the RE-NEET video solutions table
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="testName">Test Name *</Label>
              <Input
                id="testName"
                value={formData.testName}
                onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                placeholder="e.g., RE-NEET TEST - 01"
                required
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., PHYSICS SOLUTION"
                required
              />
            </div>
            <div>
              <Label htmlFor="videoLink">Video Link (Optional)</Label>
              <Input
                id="videoLink"
                value={formData.videoLink}
                onChange={(e) => setFormData({ ...formData, videoLink: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                type="url"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty if not available. Must start with http:// or https://</p>
            </div>
            <div>
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                type="number"
                min="0"
                placeholder="0"
              />
              <p className="text-sm text-gray-500 mt-1">Lower numbers appear first</p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateModalOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={formLoading || !formData.testName || !formData.subject}>
              {formLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit RE-NEET Video Solution</DialogTitle>
            <DialogDescription>
              Update the RE-NEET video solution entry
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-testName">Test Name *</Label>
              <Input
                id="edit-testName"
                value={formData.testName}
                onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                placeholder="e.g., RE-NEET TEST - 01"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-subject">Subject *</Label>
              <Input
                id="edit-subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., PHYSICS SOLUTION"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-videoLink">Video Link (Optional)</Label>
              <Input
                id="edit-videoLink"
                value={formData.videoLink}
                onChange={(e) => setFormData({ ...formData, videoLink: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                type="url"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty if not available. Must start with http:// or https://</p>
            </div>
            <div>
              <Label htmlFor="edit-order">Order</Label>
              <Input
                id="edit-order"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                type="number"
                min="0"
                placeholder="0"
              />
              <p className="text-sm text-gray-500 mt-1">Lower numbers appear first</p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingItem(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={formLoading || !formData.testName || !formData.subject}>
              {formLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>View RE-NEET Video Solution</DialogTitle>
            <DialogDescription>
              Details of the RE-NEET video solution
            </DialogDescription>
          </DialogHeader>
          {viewingItem && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Test Name</Label>
                <p className="text-sm font-medium">{viewingItem.testName}</p>
              </div>
              <div>
                <Label>Subject</Label>
                <p className="text-sm font-medium">{viewingItem.subject}</p>
              </div>
              <div>
                <Label>Video Link</Label>
                {viewingItem.videoLink ? (
                  <a
                    href={viewingItem.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {viewingItem.videoLink}
                  </a>
                ) : (
                  <p className="text-sm text-gray-400">No link provided</p>
                )}
              </div>
              <div>
                <Label>Order</Label>
                <p className="text-sm font-medium">{viewingItem.order}</p>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">
                  {viewingItem.isActive ? (
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
                </div>
              </div>
              <div>
                <Label>Created At</Label>
                <p className="text-sm text-gray-600">
                  {new Date(viewingItem.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <Label>Updated At</Label>
                <p className="text-sm text-gray-600">
                  {new Date(viewingItem.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
