"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Upload,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Target
} from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from '@/hooks/use-toast';
import { bannerApi, Banner as ApiBanner } from '@/lib/api';

interface Banner {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  imageAlt: string;
  mobileImageUrl?: string;
  mobileImageAlt?: string;
  linkUrl?: string;
  position: 'hero' | 'sidebar' | 'footer' | 'popup';
  isActive: boolean;
  priority: number;
  targetAudience?: string[];
  clicks: number;
  impressions: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function BannerManagementPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await bannerApi.getBanners();
        if (response.success) {
          setBanners(response.data.banners || []);
        } else {
          toast({
            title: "Error loading banners",
            description: response.error || "Failed to load banners",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
        toast({
          title: "Error loading banners",
          description: "Failed to load banners. Please try again.",
          variant: "destructive",
        });
      } finally {
      setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const filteredBanners = banners.filter(banner => {
    const matchesSearch = banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         banner.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === 'all' || banner.position === positionFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && banner.isActive) ||
                         (statusFilter === 'inactive' && !banner.isActive);
    
    return matchesSearch && matchesPosition && matchesStatus;
  });

  const getPositionBadge = (position: string) => {
    const positionConfig = {
      hero: { variant: 'default' as const, className: 'bg-blue-100 text-blue-800 border-blue-200' },
      sidebar: { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 border-gray-200' },
      footer: { variant: 'outline' as const, className: 'bg-green-100 text-green-800 border-green-200' },
      popup: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200' }
    };
    
    const config = positionConfig[position as keyof typeof positionConfig];
    
    return (
      <Badge variant="outline" className={`${config.className} px-2 py-1 text-xs`}>
        {position.charAt(0).toUpperCase() + position.slice(1)}
      </Badge>
    );
  };

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


  const handleViewBanner = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsViewDialogOpen(true);
  };

  const handleEditBanner = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsEditDialogOpen(true);
  };

  const handleDeleteBanner = async (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      try {
        const response = await bannerApi.deleteBanner(id);
        if (response.success) {
      setBanners(banners.filter(b => b._id !== id));
      toast({
        title: "Banner deleted",
        description: "The banner has been successfully deleted.",
      });
        } else {
          toast({
            title: "Error deleting banner",
            description: response.error || "Failed to delete banner",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error deleting banner:', error);
        toast({
          title: "Error deleting banner",
          description: "Failed to delete banner. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await bannerApi.toggleBannerStatus(id);
      if (response.success) {
    setBanners(banners.map(banner => 
      banner._id === id 
        ? { ...banner, isActive: !banner.isActive, updatedAt: new Date().toISOString() }
        : banner
    ));
    toast({
      title: "Banner status updated",
      description: "The banner status has been successfully updated.",
    });
      } else {
        toast({
          title: "Error updating banner status",
          description: response.error || "Failed to update banner status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error toggling banner status:', error);
      toast({
        title: "Error updating banner status",
        description: "Failed to update banner status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBanner = async (updatedBanner: Partial<Banner>) => {
    if (selectedBanner) {
      try {
        const response = await bannerApi.updateBanner(selectedBanner._id, updatedBanner);
        if (response.success) {
      setBanners(banners.map(b => 
        b._id === selectedBanner._id 
          ? { ...b, ...updatedBanner, updatedAt: new Date().toISOString() }
          : b
      ));
      setIsEditDialogOpen(false);
      setSelectedBanner(null);
      toast({
        title: "Banner updated",
        description: "The banner has been successfully updated.",
      });
        } else {
          toast({
            title: "Error updating banner",
            description: response.error || "Failed to update banner",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error updating banner:', error);
        toast({
          title: "Error updating banner",
          description: "Failed to update banner. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCreateBanner = async (newBanner: Omit<Banner, '_id' | 'createdAt' | 'updatedAt' | 'clicks' | 'impressions'>) => {
    try {
      const response = await bannerApi.createBanner(newBanner);
      if (response.success) {
        setBanners([response.data, ...banners]);
    setIsCreateDialogOpen(false);
    toast({
      title: "Banner created",
      description: "The banner has been successfully created.",
    });
      } else {
        toast({
          title: "Error creating banner",
          description: response.error || "Failed to create banner",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating banner:', error);
      toast({
        title: "Error creating banner",
        description: "Failed to create banner. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading banners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
          <p className="text-gray-600">Manage website banners and advertisements</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Banner
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Banners</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{banners.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Banners</CardTitle>
            <ToggleRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {banners.filter(b => b.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

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
                  placeholder="Search banners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="hero">Hero</SelectItem>
                <SelectItem value="sidebar">Sidebar</SelectItem>
                <SelectItem value="footer">Footer</SelectItem>
                <SelectItem value="popup">Popup</SelectItem>
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

      {/* Banners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Banners ({filteredBanners.length})</CardTitle>
          <CardDescription>Manage website banners and track their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banner</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBanners.map((banner) => (
                <TableRow key={banner._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-sm">{banner.title}</p>
                        <p className="text-xs text-gray-500 truncate max-w-32">
                          {banner.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <div className="h-12 w-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                        {banner.imageUrl ? (
                          <img 
                            src={banner.imageUrl} 
                            alt={banner.imageAlt}
                            className="h-full w-full object-cover"
                            title="Desktop Image"
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div className="h-12 w-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                        {banner.mobileImageUrl ? (
                          <img 
                            src={banner.mobileImageUrl} 
                            alt={banner.mobileImageAlt}
                            className="h-full w-full object-cover"
                            title="Mobile Image"
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-1">
                      <span className="text-xs text-gray-500">Desktop</span>
                      <span className="text-xs text-gray-500">Mobile</span>
                    </div>
                  </TableCell>
                  <TableCell>{getPositionBadge(banner.position)}</TableCell>
                  <TableCell>{getStatusBadge(banner.isActive)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 px-2 py-1 text-xs">
                      {banner.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewBanner(banner)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditBanner(banner)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(banner._id)}
                      >
                        {banner.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBanner(banner._id)}
                      >
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

      {/* View Banner Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Banner Details</DialogTitle>
            <DialogDescription>
              View complete banner information and performance metrics
            </DialogDescription>
          </DialogHeader>
          {selectedBanner && (
            <div className="h-[70vh] overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Title</Label>
                  <p className="text-sm text-gray-600">{selectedBanner.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Position</Label>
                  <div className="mt-1">{getPositionBadge(selectedBanner.position)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedBanner.isActive)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <p className="text-sm text-gray-600">{selectedBanner.priority}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Link URL</Label>
                  <p className="text-sm text-gray-600 break-all">{selectedBanner.linkUrl || 'No link'}</p>
                </div>
              </div>
              
              {/* Banner Images Preview */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Desktop Image</Label>
                  <div className="mt-2">
                    {selectedBanner.imageUrl ? (
                      <div className="space-y-2">
                        <img 
                          src={selectedBanner.imageUrl} 
                          alt={selectedBanner.imageAlt}
                          className="max-w-full h-auto rounded-lg border shadow-sm"
                        />
                        <div className="text-xs text-gray-500">
                          <p><strong>Alt Text:</strong> {selectedBanner.imageAlt}</p>
                          <p><strong>URL:</strong> <span className="break-all">{selectedBanner.imageUrl}</span></p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No desktop image uploaded</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Mobile Image</Label>
                  <div className="mt-2">
                    {selectedBanner.mobileImageUrl ? (
                      <div className="space-y-2">
                        <img 
                          src={selectedBanner.mobileImageUrl} 
                          alt={selectedBanner.mobileImageAlt}
                          className="max-w-full h-auto rounded-lg border shadow-sm"
                        />
                        <div className="text-xs text-gray-500">
                          <p><strong>Alt Text:</strong> {selectedBanner.mobileImageAlt}</p>
                          <p><strong>URL:</strong> <span className="break-all">{selectedBanner.mobileImageUrl}</span></p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No mobile image uploaded</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {selectedBanner?.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-gray-600 mt-1 p-3 bg-gray-50 rounded-md">
                    {selectedBanner.description}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-gray-600">
                    {selectedBanner?.createdAt ? new Date(selectedBanner.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm text-gray-600">
                    {selectedBanner?.updatedAt ? new Date(selectedBanner.updatedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Banner Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Banner</DialogTitle>
            <DialogDescription>
              Update banner information and settings
            </DialogDescription>
          </DialogHeader>
          {selectedBanner && (
            <EditBannerForm
              banner={selectedBanner}
              onSave={handleUpdateBanner}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Banner Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Banner</DialogTitle>
            <DialogDescription>
              Create a new banner for the website
            </DialogDescription>
          </DialogHeader>
          <CreateBannerForm
            onSave={handleCreateBanner}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Edit Banner Form Component
function EditBannerForm({ 
  banner, 
  onSave, 
  onCancel 
}: { 
  banner: Banner; 
  onSave: (data: Partial<Banner>) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    title: banner.title,
    description: banner.description || '',
    imageUrl: banner.imageUrl,
    imageAlt: banner.imageAlt,
    mobileImageUrl: banner.mobileImageUrl || '',
    mobileImageAlt: banner.mobileImageAlt || '',
    linkUrl: banner.linkUrl || '',
    position: banner.position,
    isActive: banner.isActive,
    priority: banner.priority,
    targetAudience: banner.targetAudience || [],
    createdBy: banner.createdBy
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="h-[70vh] overflow-y-auto space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="position">Position</Label>
          <Select value={formData.position} onValueChange={(value) => setFormData({...formData, position: value as any})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hero">Hero</SelectItem>
              <SelectItem value="sidebar">Sidebar</SelectItem>
              <SelectItem value="footer">Footer</SelectItem>
              <SelectItem value="popup">Popup</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={2}
        />
      </div>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Desktop Image</h4>
          <ImageUpload
            value={formData.imageUrl}
            onChange={(value) => {
              setFormData(prev => ({...prev, imageUrl: value}));
            }}
            onAltChange={(alt) => {
              setFormData(prev => ({...prev, imageAlt: alt}));
            }}
            altValue={formData.imageAlt}
            label="Desktop Banner Image"
            required
            maxSize={10}
            acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']}
            preview={true}
            requiredDimensions={{
              width: 1920,
              height: 400,
              label: "Desktop"
            }}
          />
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Mobile Image (Optional)</h4>
          <ImageUpload
            value={formData.mobileImageUrl}
            onChange={(value) => {
              setFormData(prev => ({...prev, mobileImageUrl: value}));
            }}
            onAltChange={(alt) => {
              setFormData(prev => ({...prev, mobileImageAlt: alt}));
            }}
            altValue={formData.mobileImageAlt}
            label="Mobile Banner Image"
            maxSize={10}
            acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']}
            preview={true}
            requiredDimensions={{
              width: 640,
              height: 280,
              label: "Mobile"
            }}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="linkUrl">Link URL</Label>
        <Input
          id="linkUrl"
          value={formData.linkUrl}
          onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
        />
      </div>
        <div>
          <Label htmlFor="priority">Priority (0-100)</Label>
          <Input
            id="priority"
            type="number"
            min="0"
            max="100"
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
          />
        </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  );
}

// Create Banner Form Component
function CreateBannerForm({ 
  onSave, 
  onCancel 
}: { 
  onSave: (data: Omit<Banner, '_id' | 'createdAt' | 'updatedAt' | 'clicks' | 'impressions'>) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    imageAlt: '',
    mobileImageUrl: '',
    mobileImageAlt: '',
    linkUrl: '',
    position: 'hero' as const,
    isActive: true,
    priority: 50,
    targetAudience: [] as string[],
    createdBy: 'Admin'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="h-[70vh] overflow-y-auto space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="position">Position</Label>
          <Select value={formData.position} onValueChange={(value) => setFormData({...formData, position: value as any})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hero">Hero</SelectItem>
              <SelectItem value="sidebar">Sidebar</SelectItem>
              <SelectItem value="footer">Footer</SelectItem>
              <SelectItem value="popup">Popup</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={2}
        />
      </div>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Desktop Image</h4>
          <ImageUpload
            value={formData.imageUrl}
            onChange={(value) => {
              setFormData(prev => ({...prev, imageUrl: value}));
            }}
            onAltChange={(alt) => {
              setFormData(prev => ({...prev, imageAlt: alt}));
            }}
            altValue={formData.imageAlt}
            label="Desktop Banner Image"
            required
            maxSize={10}
            acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']}
            preview={true}
            requiredDimensions={{
              width: 1920,
              height: 400,
              label: "Desktop"
            }}
          />
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Mobile Image (Optional)</h4>
          <ImageUpload
            value={formData.mobileImageUrl}
            onChange={(value) => {
              setFormData(prev => ({...prev, mobileImageUrl: value}));
            }}
            onAltChange={(alt) => {
              setFormData(prev => ({...prev, mobileImageAlt: alt}));
            }}
            altValue={formData.mobileImageAlt}
            label="Mobile Banner Image"
            maxSize={10}
            acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']}
            preview={true}
            requiredDimensions={{
              width: 640,
              height: 280,
              label: "Mobile"
            }}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="linkUrl">Link URL</Label>
        <Input
          id="linkUrl"
          value={formData.linkUrl}
          onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
        />
      </div>
        <div>
          <Label htmlFor="priority">Priority (0-100)</Label>
          <Input
            id="priority"
            type="number"
            min="0"
            max="100"
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
          />
        </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Banner
        </Button>
      </div>
    </form>
  );
}
