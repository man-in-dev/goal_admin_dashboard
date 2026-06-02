"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Search, Eye, Edit, Trash2, Plus, Image as ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from '@/hooks/use-toast';
import { pageImageApi, PageImage as ApiPageImage, pageSettingApi, PageSetting as ApiPageSetting } from '@/lib/api';

export default function PageImagesManagementPage() {
  const [images, setImages] = useState<ApiPageImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageFilter, setPageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState<ApiPageImage | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await pageImageApi.getPageImages();
        if (response.success) {
          setImages(response.data || []);
        } else {
          toast({
            title: "Error loading page images",
            description: response.error || "Failed to load images",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        toast({
          title: "Error loading page images",
          description: "Failed to load images. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const filteredImages = images.filter(img => {
    const matchesSearch = img.page.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPage = pageFilter === 'all' || img.page === pageFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && img.isActive) ||
                         (statusFilter === 'inactive' && !img.isActive);
    
    return matchesSearch && matchesPage && matchesStatus;
  });

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge 
        variant="outline" 
        className={`flex items-center gap-1 px-2 py-1 text-xs ${
          isActive 
            ? 'bg-green-100 text-green-800 border-green-200' 
            : 'bg-gray-100 text-gray-600 border-gray-200'
        }`}
      >
        {isActive ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const handleViewImage = (img: ApiPageImage) => {
    setSelectedImage(img);
    setIsViewDialogOpen(true);
  };

  const handleEditImage = (img: ApiPageImage) => {
    setSelectedImage(img);
    setIsEditDialogOpen(true);
  };

  const handleDeleteImage = async (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      try {
        const response = await pageImageApi.deletePageImage(id);
        if (response.success) {
          setImages(images.filter(b => b._id !== id));
          toast({
            title: "Image deleted",
            description: "The image has been successfully deleted.",
          });
        } else {
          toast({
            title: "Error deleting image",
            description: response.error || "Failed to delete image",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        toast({
          title: "Error deleting image",
          description: "Failed to delete image. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await pageImageApi.togglePageImageStatus(id);
      if (response.success) {
        setImages(images.map(img => 
          img._id === id 
            ? { ...img, isActive: !img.isActive, updatedAt: new Date().toISOString() }
            : img
        ));
        toast({
          title: "Image status updated",
          description: "The image status has been successfully updated.",
        });
      } else {
        toast({
          title: "Error updating image status",
          description: response.error || "Failed to update image status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error toggling image status:', error);
      toast({
        title: "Error updating image status",
        description: "Failed to update image status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateImage = async (updatedImage: Partial<ApiPageImage>) => {
    if (selectedImage) {
      try {
        const response = await pageImageApi.updatePageImage(selectedImage._id, updatedImage);
        if (response.success) {
          setImages(images.map(b => 
            b._id === selectedImage._id 
              ? { ...b, ...updatedImage, updatedAt: new Date().toISOString() }
              : b
          ));
          setIsEditDialogOpen(false);
          setSelectedImage(null);
          toast({
            title: "Image updated",
            description: "The image has been successfully updated.",
          });
        } else {
          toast({
            title: "Error updating image",
            description: response.error || "Failed to update image",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error updating image:', error);
        toast({
          title: "Error updating image",
          description: "Failed to update image. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCreateImages = async (newImages: Omit<ApiPageImage, '_id' | 'createdAt' | 'updatedAt'>[]) => {
    try {
      const addedImages: ApiPageImage[] = [];
      for (const newImage of newImages) {
        const response = await pageImageApi.createPageImage(newImage);
        if (response.success) {
          addedImages.push(response.data);
        } else {
          toast({
            title: "Error creating image",
            description: response.error || "Failed to create image",
            variant: "destructive",
          });
        }
      }
      
      if (addedImages.length > 0) {
        setImages((prev) => [...addedImages, ...prev]);
        setIsCreateDialogOpen(false);
        toast({
          title: "Images created",
          description: `${addedImages.length} images have been successfully created.`,
        });
      }
    } catch (error) {
      console.error('Error creating images:', error);
      toast({
        title: "Error creating images",
        description: "Failed to create images. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading page images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Page Images Management</h1>
          <p className="text-gray-600">Manage images for specific pages</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Image
          </Button>
        </div>
      </div>

      <PageSettingsSection />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by page..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={pageFilter} onValueChange={setPageFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pages</SelectItem>
                <SelectItem value="medical-test-series">Medical Test Series</SelectItem>
                <SelectItem value="engineering-test-series-aits">Engineering Test Series - AITS</SelectItem>
                <SelectItem value="engineering-test-series-spot">Engineering Test Series - SPOT</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Images Table */}
      <Card>
        <CardHeader>
          <CardTitle>Page Images ({filteredImages.length})</CardTitle>
          <CardDescription>Manage images uploaded for pages</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredImages.map((img) => (
                <TableRow key={img._id}>
                  <TableCell>
                    <div className="flex space-x-2">
                      <div className="h-12 w-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                        {img.imageUrl ? (
                          <img 
                            src={img.imageUrl} 
                            alt={img.imageAlt || 'Page Image'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{img.page}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(img.isActive)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 px-2 py-1 text-xs">
                      {img.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewImage(img)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditImage(img)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(img._id)}>
                        {img.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteImage(img._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Image Details</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="h-[70vh] overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Page</Label>
                  <p className="text-sm text-gray-600">{selectedImage.page}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedImage.isActive)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <p className="text-sm text-gray-600">{selectedImage.priority}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Image</Label>
                  <div className="mt-2">
                    {selectedImage.imageUrl ? (
                      <div className="space-y-2">
                        <img 
                          src={selectedImage.imageUrl} 
                          alt={selectedImage.imageAlt || ''}
                          className="max-w-full h-auto rounded-lg border shadow-sm"
                        />
                        <div className="text-xs text-gray-500">
                          <p><strong>URL:</strong> <span className="break-all">{selectedImage.imageUrl}</span></p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No image uploaded</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <EditImageForm
              image={selectedImage}
              onSave={handleUpdateImage}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Image</DialogTitle>
          </DialogHeader>
          <CreateImageForm
            onSave={handleCreateImages}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditImageForm({ 
  image, 
  onSave, 
  onCancel 
}: { 
  image: ApiPageImage; 
  onSave: (data: Partial<ApiPageImage>) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    page: image.page,
    imageUrl: image.imageUrl,
    imageAlt: image.imageAlt || '',
    isActive: image.isActive,
    priority: image.priority
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="h-[70vh] overflow-y-auto space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="page">Page</Label>
          <Select value={formData.page} onValueChange={(value) => setFormData({...formData, page: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="medical-test-series">Medical Test Series</SelectItem>
              <SelectItem value="engineering-test-series-aits">Engineering Test Series - AITS</SelectItem>
              <SelectItem value="engineering-test-series-spot">Engineering Test Series - SPOT</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Image</h4>
          <ImageUpload
            value={formData.imageUrl}
            onChange={(value) => setFormData(prev => ({...prev, imageUrl: value}))}
            label="Page Image"
            required
            maxSize={10}
            acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']}
            preview={true}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="priority">Priority (0-100) (Higher shows first)</Label>
        <Input
          id="priority"
          type="number"
          min="0"
          max="100"
          value={formData.priority}
          onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}

function CreateImageForm({ 
  onSave, 
  onCancel
}: { 
  onSave: (data: Omit<ApiPageImage, '_id' | 'createdAt' | 'updatedAt'>[]) => void; 
  onCancel: () => void; 
}) {
  const [page, setPage] = useState('medical-test-series');
  const [isActive, setIsActive] = useState(true);
  const [items, setItems] = useState([{ imageUrl: '', imageAlt: '', priority: 0 }]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(item => item.imageUrl);
    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one image",
        variant: "destructive"
      });
      return;
    }
    
    const payload = validItems.map(item => ({
      page,
      isActive,
      imageUrl: item.imageUrl,
      imageAlt: item.imageAlt,
      priority: item.priority
    }));
    
    onSave(payload);
  };

  const addItem = () => {
    setItems([...items, { imageUrl: '', imageAlt: '', priority: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  return (
    <form onSubmit={handleSubmit} className="h-[70vh] overflow-y-auto space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="page">Page</Label>
          <Select value={page} onValueChange={setPage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="medical-test-series">Medical Test Series</SelectItem>
              <SelectItem value="engineering-test-series-aits">Engineering Test Series - AITS</SelectItem>
              <SelectItem value="engineering-test-series-spot">Engineering Test Series - SPOT</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2 mt-8">
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="isActive">Active (Applies to all)</Label>
        </div>
      </div>
      
      <div className="space-y-6">
        {items.map((item, index) => (
          <Card key={index}>
            <CardHeader className="py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Image {index + 1}</CardTitle>
              {items.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload
                value={item.imageUrl}
                onChange={(value) => updateItem(index, 'imageUrl', value)}
                label="Upload Image"
                required
                maxSize={10}
                acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']}
                preview={true}
              />
              <div>
                <Label>Priority (0-100) (Higher shows first)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={item.priority}
                  onChange={(e) => updateItem(index, 'priority', parseInt(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={addItem}>
        <Plus className="h-4 w-4 mr-2" /> Add Another Image
      </Button>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Upload Images</Button>
      </div>
    </form>
  );
}

function PageSettingsSection() {
  const [settings, setSettings] = useState<ApiPageSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const pageConfigs = [
    {
      page: 'medical-test-series',
      title: 'Medical Test Series Page Text Settings',
      keys: [
        { key: 're_neet_heading', label: 'RE-NEET 2026 Schedule Heading', defaultValue: 'RE-NEET 2026 SCHEDULE' }
      ]
    },
    {
      page: 'engineering-test-series',
      title: 'Engineering Test Series Page Text Settings',
      keys: [
        { key: 'aits_heading', label: 'AITS Test Series Heading', defaultValue: 'AITS Test Series Schedule' }
      ]
    }
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const [medicalRes, engRes] = await Promise.all([
          pageSettingApi.getSettingsByPage('medical-test-series'),
          pageSettingApi.getSettingsByPage('engineering-test-series')
        ]);
        
        const allSettings = [
          ...(medicalRes.data || []),
          ...(engRes.data || [])
        ];
        
        setSettings(allSettings);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const getSettingValue = (page: string, key: string, defaultValue: string) => {
    const setting = settings.find(s => s.page === page && s.key === key);
    return setting ? setting.value : defaultValue;
  };

  const handleUpdateSetting = async (page: string, key: string, value: string) => {
    try {
      setSaving(true);
      const response = await pageSettingApi.updateSetting(page, key, value);
      
      if (response.success) {
        setSettings(prev => {
          const exists = prev.find(s => s.page === page && s.key === key);
          if (exists) {
            return prev.map(s => (s.page === page && s.key === key) ? { ...s, value } : s);
          } else {
            return [...prev, response.data];
          }
        });
        toast({
          title: "Setting updated",
          description: "The page setting has been successfully updated.",
        });
      } else {
        toast({
          title: "Error updating setting",
          description: response.error || "Failed to update setting",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Error updating setting",
        description: "Failed to update setting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {pageConfigs.map((config) => (
        <Card key={config.page} className="border-purple-200 shadow-sm">
          <CardHeader className="bg-purple-50/50 pb-4">
            <CardTitle className="text-lg">{config.title}</CardTitle>
            <CardDescription>Update dynamic text content</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {config.keys.map((k) => {
              const currentValue = getSettingValue(config.page, k.key, k.defaultValue);
              
              return (
                <div key={k.key} className="space-y-2">
                  <Label htmlFor={`${config.page}-${k.key}`}>{k.label}</Label>
                  <div className="flex gap-2">
                    <Input 
                      id={`${config.page}-${k.key}`} 
                      defaultValue={currentValue}
                      onBlur={(e) => {
                        if (e.target.value !== currentValue) {
                           handleUpdateSetting(config.page, k.key, e.target.value);
                        }
                      }}
                    />
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        const el = document.getElementById(`${config.page}-${k.key}`) as HTMLInputElement;
                        if (el && el.value !== currentValue) {
                          handleUpdateSetting(config.page, k.key, el.value);
                        }
                      }}
                      disabled={saving}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
