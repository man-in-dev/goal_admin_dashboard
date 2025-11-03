"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { QuillEditor } from '@/components/ui/quill-editor';
import { 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Newspaper,
  Calendar,
  Star,
  Eye as EyeIcon,
  Heart,
  Share2,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Clock,
  Megaphone,
  FileText
} from 'lucide-react';
import { newsEventApi, NewsEvent } from '@/lib/api';

export default function NewsEventsPage() {
  const [newsEvents, setNewsEvents] = useState<NewsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [operationLoading, setOperationLoading] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsEvent | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<NewsEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'announcement' as 'announcement' | 'news' | 'event',
    publishDate: '',
    publishTime: '',
    location: '',
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const fetchNewsEvents = async () => {
      try {
        setLoading(true);
        const response = await newsEventApi.getNewsEvents({
          page: 1,
          limit: 50,
          sortBy: 'publishDate',
          sortOrder: 'desc'
        });
        
        if (response.success) {
          setNewsEvents(response.data.newsEvents || []);
        } else {
          console.error('Failed to fetch news events:', response.message);
          // Fallback to mock data if API fails
          setNewsEvents([
            {
              _id: '1',
              title: 'NEET 2025 Registration Extended - Last Date Announced',
              content: 'The National Testing Agency (NTA) has extended the registration deadline for NEET(UG) 2025 due to technical issues faced by candidates. The new deadline provides additional time for eligible candidates to complete their application process. Candidates are advised to register at the earliest to avoid last-minute rush.',
              type: 'announcement',
              publishDate: '2025-03-18T00:00:00Z',
              publishTime: '10:00 AM',
              location: 'Online',
              tags: ['Announcement', 'Registration'],
              createdBy: 'admin',
              createdAt: '2025-03-18T10:30:00Z',
              updatedAt: '2025-03-18T10:30:00Z'
            },
            {
              _id: '2',
              title: 'Annual Sports Day 2024 - Registration Open',
              content: 'Join us for the annual sports day celebration featuring various competitions including athletics, football, basketball, and more. Students from all departments are encouraged to participate. Registration is now open and will close on March 25th.',
              type: 'event',
              publishDate: '2024-03-15T00:00:00Z',
              publishTime: '2:00 PM',
              location: 'Main Campus Ground',
              tags: ['Sports', 'Event', 'Registration'],
              createdBy: 'admin',
              createdAt: '2024-03-15T14:20:00Z',
              updatedAt: '2024-03-15T14:20:00Z'
            },
            {
              _id: '3',
              title: 'New Course Launch: Advanced Mathematics',
              content: 'We are excited to announce our new advanced mathematics course starting next month. This comprehensive course covers advanced topics including calculus, linear algebra, and differential equations. Early bird registration is now available.',
              type: 'announcement',
              publishDate: '2024-03-20T00:00:00Z',
              publishTime: '9:15 AM',
              location: 'Online',
              tags: ['Course', 'Mathematics', 'Academic'],
              createdBy: 'admin',
              createdAt: '2024-03-13T09:15:00Z',
              updatedAt: '2024-03-13T09:15:00Z'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching news events:', error);
        // Fallback to mock data if API fails
        setNewsEvents([
          {
            _id: '1',
            title: 'NEET 2025 Registration Extended - Last Date Announced',
            content: 'The National Testing Agency (NTA) has extended the registration deadline for NEET(UG) 2025 due to technical issues faced by candidates. The new deadline provides additional time for eligible candidates to complete their application process. Candidates are advised to register at the earliest to avoid last-minute rush.',
            type: 'announcement',
            publishDate: '2025-03-18T00:00:00Z',
            publishTime: '10:00 AM',
            location: 'Online',
            tags: ['Announcement', 'Registration'],
            createdBy: 'admin',
            createdAt: '2025-03-18T10:30:00Z',
            updatedAt: '2025-03-18T10:30:00Z'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsEvents();
  }, []);

  const filteredData = newsEvents.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // CRUD Operations
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news/event?')) return;
    
    try {
      setOperationLoading(id);
      const response = await newsEventApi.deleteNewsEvent(id);
      
      if (response.success) {
        setNewsEvents(prev => prev.filter(item => item._id !== id));
        alert('News/Event deleted successfully');
      } else {
        alert('Failed to delete news/event');
      }
    } catch (error) {
      console.error('Error deleting news/event:', error);
      alert('Error deleting news/event');
    } finally {
      setOperationLoading(null);
    }
  };


  // Form handling functions
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleCreateNewsEvent = async () => {
    try {
      setFormLoading(true);
      
      // Validate required fields
      if (!formData.title || !formData.content) {
        alert('Please fill in all required fields (Title, Content)');
        return;
      }

      const response = await newsEventApi.createNewsEvent({
        ...formData,
        createdBy: 'admin' // This should come from auth context
      });

      if (response.success) {
        // Add the new item to the list
        setNewsEvents(prev => [response.data, ...prev]);
        
        // Reset form and close modal
        resetForm();
        setIsCreateModalOpen(false);
        
        alert('News/Event created successfully!');
      } else {
        alert('Failed to create news/event');
      }
    } catch (error) {
      console.error('Error creating news/event:', error);
      alert('Error creating news/event');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditNewsEvent = async () => {
    if (!editingItem) return;
    
    try {
      setFormLoading(true);
      
      // Validate required fields
      if (!formData.title || !formData.content) {
        alert('Please fill in all required fields (Title, Content)');
        return;
      }

      const response = await newsEventApi.updateNewsEvent(editingItem._id, formData);

      if (response.success) {
        // Update the item in the list
        setNewsEvents(prev => prev.map(item => 
          item._id === editingItem._id ? response.data : item
        ));
        
        // Reset form and close modal
        resetForm();
        setIsEditModalOpen(false);
        setEditingItem(null);
        
        alert('News/Event updated successfully!');
      } else {
        alert('Failed to update news/event');
      }
    } catch (error) {
      console.error('Error updating news/event:', error);
      alert('Error updating news/event');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'announcement',
      publishDate: '',
      publishTime: '',
      location: '',
      tags: []
    });
    setTagInput('');
  };

  const openEditModal = (item: NewsEvent) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      type: item.type,
      publishDate: item.publishDate ? new Date(item.publishDate).toISOString().split('T')[0] : '',
      publishTime: item.publishTime || '',
      location: item.location || '',
      tags: item.tags || []
    });
    setTagInput('');
    setIsEditModalOpen(true);
  };

  const openViewModal = (item: NewsEvent) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      news: { variant: 'default' as const, color: 'text-blue-600' },
      event: { variant: 'secondary' as const, color: 'text-green-600' },
      announcement: { variant: 'outline' as const, color: 'text-orange-600' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig];
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading news and events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">News & Events</h1>
          <p className="text-gray-600">Manage news articles, events, and announcements</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newsEvents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <Newspaper className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {newsEvents.filter(item => item.type === 'announcement').length}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* News & Events Table */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">News & Events ({filteredData.length})</h2>
            <p className="text-gray-600">Manage and track news articles and events</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Title</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead className="w-[130px]">Date</TableHead>
                  <TableHead className="w-[180px]">Location</TableHead>
                  <TableHead className="w-[140px]">Tags</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item._id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {item.content.substring(0, 100) + (item.content.length > 100 ? '...' : '')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`${
                          item.type === 'news' 
                            ? 'bg-blue-100 text-blue-800 border-blue-200' 
                            : item.type === 'event'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-purple-100 text-purple-800 border-purple-200'
                        } px-3 py-1`}
                      >
                        <div className="flex items-center gap-1">
                          {item.type === 'news' && <Newspaper className="w-3 h-3" />}
                          {item.type === 'event' && <Calendar className="w-3 h-3" />}
                          {item.type === 'announcement' && <Megaphone className="w-3 h-3" />}
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {item.publishDate ? new Date(item.publishDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : new Date(item.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        {item.publishTime && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {item.publishTime}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.location ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-[180px]" title={item.location}>
                            {item.location}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5 text-gray-500">
                            +{item.tags.length - 2}
                          </Badge>
                        )}
                        {item.tags.length === 0 && (
                          <span className="text-gray-400 text-sm">No tags</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openViewModal(item)}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditModal(item)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(item._id)}
                          disabled={operationLoading === item._id}
                          title="Delete"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredData.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="text-gray-500 text-lg">No news or events found</div>
                      <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create News/Event Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New News/Event</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new news article or event.
            </DialogDescription>
          </DialogHeader>
          
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter title"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content *</Label>
                <QuillEditor
                  value={formData.content}
                  onChange={(value) => handleInputChange('content', value)}
                  placeholder="Full content"
                  className="min-h-[200px]"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="publishDate">Publish Date</Label>
                <Input
                  id="publishDate"
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => handleInputChange('publishDate', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="publishTime">Publish Time</Label>
                <Input
                  id="publishTime"
                  value={formData.publishTime}
                  onChange={(e) => handleInputChange('publishTime', e.target.value)}
                  placeholder="e.g., 10:00 AM"
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Online, Main Campus"
                />
            </div>
          </div>
          
          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNewsEvent} disabled={formLoading}>
              {formLoading ? 'Creating...' : 'Create News/Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit News/Event Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit News/Event</DialogTitle>
            <DialogDescription>
              Update the details of the news article or event.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter title"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-content">Content *</Label>
              <QuillEditor
                value={formData.content}
                onChange={(value) => handleInputChange('content', value)}
                placeholder="Full content"
                className="min-h-[200px]"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="news">News</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit-publishDate">Publish Date</Label>
              <Input
                id="edit-publishDate"
                type="date"
                value={formData.publishDate}
                onChange={(e) => handleInputChange('publishDate', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-publishTime">Publish Time</Label>
              <Input
                id="edit-publishTime"
                value={formData.publishTime}
                onChange={(e) => handleInputChange('publishTime', e.target.value)}
                placeholder="e.g., 10:00 AM"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Online, Main Campus"
              />
            </div>
          </div>
          
          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditModalOpen(false);
              setEditingItem(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditNewsEvent} disabled={formLoading}>
              {formLoading ? 'Updating...' : 'Update News/Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View News/Event Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View News/Event</DialogTitle>
            <DialogDescription>
              View the details of the news article or event.
            </DialogDescription>
          </DialogHeader>
          
          {viewingItem && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge 
                    className={`${
                      viewingItem.type === 'news' 
                        ? 'bg-blue-100 text-blue-800 border-blue-200' 
                        : viewingItem.type === 'event'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-purple-100 text-purple-800 border-purple-200'
                    } px-3 py-1`}
                  >
                    <div className="flex items-center gap-2">
                      {viewingItem.type === 'news' && <Newspaper className="w-4 h-4" />}
                      {viewingItem.type === 'event' && <Calendar className="w-4 h-4" />}
                      {viewingItem.type === 'announcement' && <Megaphone className="w-4 h-4" />}
                      {viewingItem.type.charAt(0).toUpperCase() + viewingItem.type.slice(1)}
                    </div>
                  </Badge>
                  
                  {viewingItem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {viewingItem.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-gray-600 border-gray-300 px-2 py-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                  {viewingItem.title}
                </h2>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {viewingItem.publishDate 
                        ? new Date(viewingItem.publishDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : new Date(viewingItem.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                      }
                    </span>
                  </div>
                  
                  {viewingItem.publishTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{viewingItem.publishTime}</span>
                    </div>
                  )}
                  
                  {viewingItem.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{viewingItem.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Content Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Content</h3>
                <div className="prose prose-gray max-w-none">
                  <div 
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: viewingItem.content }}
                  />
                </div>
              </div>

              <Separator />

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Created By</h4>
                  <p className="text-sm text-gray-600">{viewingItem.createdBy || 'Admin'}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Created At</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(viewingItem.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                {viewingItem.updatedAt !== viewingItem.createdAt && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Last Updated</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(viewingItem.updatedAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewModalOpen(false);
              openEditModal(viewingItem!);
            }}>
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
