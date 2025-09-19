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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { QuillEditor } from '@/components/ui/quill-editor';
import { blogApi, Blog as ApiBlog } from '@/lib/api';
import { 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  BookOpen,
  Star,
  Eye as EyeIcon,
  Heart,
  MessageCircle,
  Clock,
  ToggleLeft,
  ToggleRight,
  Save,
  X,
  Upload,
  Image,
  Link,
  Type,
  AlignLeft,
  List,
  Bold,
  Italic
} from 'lucide-react';

// Use the Blog interface from API
type Blog = ApiBlog;

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [operationLoading, setOperationLoading] = useState<string | null>(null);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Blog | null>(null);
  const [viewingItem, setViewingItem] = useState<Blog | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    imageAlt: '',
    author: '',
    category: 'general' as 'education' | 'career' | 'technology' | 'lifestyle' | 'general',
    tags: [] as string[],
    isPublished: false,
    isFeatured: false,
    publishDate: '',
    metaTitle: '',
    metaDescription: '',
    seoKeywords: [] as string[],
    createdBy: 'Admin'
  });
  const [tagInput, setTagInput] = useState('');
  const [seoKeywordInput, setSeoKeywordInput] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await blogApi.getBlogs({
          page: 1,
          limit: 50,
          search: searchTerm || undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          isPublished: statusFilter === 'published' ? true : statusFilter === 'draft' ? false : undefined,
          isFeatured: statusFilter === 'featured' ? true : undefined
        });
        
        if (response.success) {
          setBlogs(response.data.blogs || []);
        } else {
          console.error('Failed to fetch blogs:', response.error);
          setBlogs([]);
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [searchTerm, categoryFilter, statusFilter]);

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || blog.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && blog.isPublished) ||
                         (statusFilter === 'draft' && !blog.isPublished) ||
                         (statusFilter === 'featured' && blog.isFeatured);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      education: { variant: 'default' as const, color: 'text-blue-600' },
      career: { variant: 'secondary' as const, color: 'text-green-600' },
      technology: { variant: 'outline' as const, color: 'text-purple-600' },
      lifestyle: { variant: 'destructive' as const, color: 'text-red-600' },
      general: { variant: 'secondary' as const, color: 'text-gray-600' }
    };
    
    const config = categoryConfig[category as keyof typeof categoryConfig];
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (isPublished: boolean, isFeatured: boolean) => {
    if (!isPublished) {
      return <Badge variant="secondary">Draft</Badge>;
    }
    if (isFeatured) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <Star className="h-3 w-3" />
          Featured
        </Badge>
      );
    }
    return <Badge variant="outline">Published</Badge>;
  };

  // Form handlers
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      featuredImage: '',
      imageAlt: '',
      author: '',
      category: 'general',
      tags: [],
      isPublished: false,
      isFeatured: false,
      publishDate: '',
      metaTitle: '',
      metaDescription: '',
      seoKeywords: [],
      createdBy: 'Admin'
    });
    setTagInput('');
    setSeoKeywordInput('');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleAddSeoKeyword = () => {
    if (seoKeywordInput.trim() && !formData.seoKeywords.includes(seoKeywordInput.trim())) {
      setFormData({
        ...formData,
        seoKeywords: [...formData.seoKeywords, seoKeywordInput.trim()]
      });
      setSeoKeywordInput('');
    }
  };

  const handleRemoveSeoKeyword = (keywordToRemove: string) => {
    setFormData({
      ...formData,
      seoKeywords: formData.seoKeywords.filter(keyword => keyword !== keywordToRemove)
    });
  };

  const openEditModal = (item: Blog) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      excerpt: item.excerpt || '',
      featuredImage: item.featuredImage || '',
      imageAlt: item.imageAlt || '',
      author: item.author,
      category: item.category,
      tags: item.tags || [],
      isPublished: item.isPublished,
      isFeatured: item.isFeatured,
      publishDate: item.publishDate ? new Date(item.publishDate).toISOString().split('T')[0] : '',
      metaTitle: item.metaTitle || '',
      metaDescription: item.metaDescription || '',
      seoKeywords: item.seoKeywords || [],
      createdBy: item.createdBy
    });
    setTagInput('');
    setSeoKeywordInput('');
    setIsEditModalOpen(true);
  };

  const openViewModal = (item: Blog) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };


  const handleCreateBlog = async () => {
    // Get content from form data
    const content = formData.content;
    
    if (!formData.title || !content || !formData.author) {
      alert('Please fill in all required fields');
      return;
    }

    setFormLoading(true);
    try {
      
      const newBlog: any = {
        ...formData,
        content,
        publishDate: formData.publishDate ? new Date(formData.publishDate).toISOString() : undefined,
        // Remove slug - it will be auto-generated by backend
        slug: undefined
      };
      
      // Remove undefined values
      Object.keys(newBlog).forEach(key => {
        if (newBlog[key] === undefined) {
          delete newBlog[key];
        }
      });

      const response = await blogApi.createBlog(newBlog);
      
      if (response.success) {
        setIsCreateModalOpen(false);
        resetForm();
        // Refresh blogs list
        window.location.reload(); // Simple refresh for now
      } else {
        alert('Failed to create blog: ' + response.error);
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      alert('Error creating blog. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditBlog = async () => {
    // Get content from form data
    const content = formData.content;
    
    if (!editingItem || !formData.title || !content || !formData.author) {
      alert('Please fill in all required fields');
      return;
    }

    setFormLoading(true);
    try {
      
      const updatedBlog: any = {
        ...formData,
        content,
        publishDate: formData.publishDate ? new Date(formData.publishDate).toISOString() : undefined,
        // Remove slug - it will be auto-generated by backend if title changes
        slug: undefined
      };
      
      // Remove undefined values
      Object.keys(updatedBlog).forEach(key => {
        if (updatedBlog[key] === undefined) {
          delete updatedBlog[key];
        }
      });

      const response = await blogApi.updateBlog(editingItem._id, updatedBlog);
      
      if (response.success) {
        setIsEditModalOpen(false);
        setEditingItem(null);
        resetForm();
        // Refresh blogs list
        window.location.reload(); // Simple refresh for now
      } else {
        alert('Failed to update blog: ' + response.error);
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      alert('Error updating blog. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    
    setOperationLoading(id);
    try {
      const response = await blogApi.deleteBlog(id);
      
      if (response.success) {
        // Refresh blogs list
        window.location.reload(); // Simple refresh for now
      } else {
        alert('Failed to delete blog: ' + response.error);
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Error deleting blog. Please try again.');
    } finally {
      setOperationLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600">Manage blog articles and content</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Blog
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <ToggleRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {blogs.filter(blog => blog.isPublished).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {blogs.filter(blog => blog.isFeatured).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <EyeIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {blogs.reduce((sum, blog) => sum + blog.views, 0).toLocaleString()}
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
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="career">Career</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="lifestyle">Lifestyle</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Blogs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blogs ({filteredBlogs.length})</CardTitle>
          <CardDescription>Manage blog articles and track engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBlogs.map((blog) => (
                <TableRow key={blog._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{blog.title}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {blog.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {blog.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {blog.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{blog.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(blog.category)}</TableCell>
                  <TableCell>{blog.author}</TableCell>
                  <TableCell>{getStatusBadge(blog.isPublished, blog.isFeatured)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openViewModal(blog)}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditModal(blog)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(blog._id)}
                        disabled={operationLoading === blog._id}
                        title="Delete"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

      {/* Create Blog Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Blog</DialogTitle>
            <DialogDescription>
              Create a new blog article with rich text formatting.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter blog title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Enter author name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="career">Career</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="publishDate">Publish Date</Label>
                <Input
                  id="publishDate"
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief description of the blog"
                rows={3}
              />
            </div>

            {/* Content Editor */}
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <QuillEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                placeholder="Write your blog content here..."
                className="min-h-[400px]"
              />
              <p className="text-sm text-gray-500">
                Use the rich text editor to format your content with headings, lists, links, and more
              </p>
            </div>

            {/* Featured Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="featuredImage">Featured Image URL</Label>
                <Input
                  id="featuredImage"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageAlt">Image Alt Text</Label>
                <Input
                  id="imageAlt"
                  value={formData.imageAlt}
                  onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                  placeholder="Describe the image"
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

            {/* SEO Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">SEO Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    placeholder="SEO title (max 60 characters)"
                    maxLength={60}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    placeholder="SEO description (max 160 characters)"
                    maxLength={160}
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>SEO Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    value={seoKeywordInput}
                    onChange={(e) => setSeoKeywordInput(e.target.value)}
                    placeholder="Add SEO keyword"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSeoKeyword())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddSeoKeyword}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.seoKeywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleRemoveSeoKeyword(keyword)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Publishing Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Publishing Options</h3>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isPublished">Publish immediately</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isFeatured">Feature this blog</Label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateModalOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateBlog} disabled={formLoading}>
              {formLoading ? 'Creating...' : 'Create Blog'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Blog Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog</DialogTitle>
            <DialogDescription>
              Update the blog article with rich text formatting.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter blog title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-author">Author *</Label>
                <Input
                  id="edit-author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Enter author name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="career">Career</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-publishDate">Publish Date</Label>
                <Input
                  id="edit-publishDate"
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-excerpt">Excerpt</Label>
              <Textarea
                id="edit-excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief description of the blog"
                rows={3}
              />
            </div>

            {/* Content Editor */}
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content *</Label>
              <QuillEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                placeholder="Write your blog content here..."
                className="min-h-[400px]"
              />
              <p className="text-sm text-gray-500">
                Use the rich text editor to format your content with headings, lists, links, and more
              </p>
            </div>

            {/* Featured Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-featuredImage">Featured Image URL</Label>
                <Input
                  id="edit-featuredImage"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-imageAlt">Image Alt Text</Label>
                <Input
                  id="edit-imageAlt"
                  value={formData.imageAlt}
                  onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                  placeholder="Describe the image"
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

            {/* SEO Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">SEO Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-metaTitle">Meta Title</Label>
                  <Input
                    id="edit-metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    placeholder="SEO title (max 60 characters)"
                    maxLength={60}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-metaDescription">Meta Description</Label>
                  <Textarea
                    id="edit-metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    placeholder="SEO description (max 160 characters)"
                    maxLength={160}
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>SEO Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    value={seoKeywordInput}
                    onChange={(e) => setSeoKeywordInput(e.target.value)}
                    placeholder="Add SEO keyword"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSeoKeyword())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddSeoKeyword}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.seoKeywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleRemoveSeoKeyword(keyword)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Publishing Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Publishing Options</h3>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="edit-isPublished">Publish immediately</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="edit-isFeatured">Feature this blog</Label>
                </div>
              </div>
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
            <Button onClick={handleEditBlog} disabled={formLoading}>
              {formLoading ? 'Updating...' : 'Update Blog'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Blog Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Blog</DialogTitle>
            <DialogDescription>
              View the blog article details and content.
            </DialogDescription>
          </DialogHeader>
          
          {viewingItem && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className={`${
                    viewingItem.category === 'education' 
                      ? 'bg-blue-100 text-blue-800 border-blue-200' 
                      : viewingItem.category === 'career'
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : viewingItem.category === 'technology'
                      ? 'bg-purple-100 text-purple-800 border-purple-200'
                      : viewingItem.category === 'lifestyle'
                      ? 'bg-red-100 text-red-800 border-red-200'
                      : 'bg-gray-100 text-gray-800 border-gray-200'
                  } px-3 py-1`}>
                    {viewingItem.category.charAt(0).toUpperCase() + viewingItem.category.slice(1)}
                  </Badge>
                  
                  {viewingItem.isFeatured && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Featured
                    </Badge>
                  )}
                  
                  {viewingItem.isPublished ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Published
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                  
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
                    <BookOpen className="w-4 h-4" />
                    <span>By {viewingItem.author}</span>
                  </div>
                  
                  {viewingItem.publishDate && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(viewingItem.publishDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{viewingItem.readingTime} min read</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <EyeIcon className="w-4 h-4" />
                    <span>{viewingItem.views.toLocaleString()} views</span>
                  </div>
                </div>

                {viewingItem.excerpt && (
                  <p className="text-lg text-gray-700 italic border-l-4 border-blue-500 pl-4">
                    {viewingItem.excerpt}
                  </p>
                )}
              </div>

              <Separator />

              {/* Featured Image */}
              {viewingItem.featuredImage && (
                <div className="space-y-2">
                  <img 
                    src={viewingItem.featuredImage} 
                    alt={viewingItem.imageAlt || viewingItem.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              <Separator />

              {/* Content Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Content</h3>
                <div 
                  className="prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: viewingItem.content }}
                />
              </div>

              <Separator />

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Created By</h4>
                  <p className="text-sm text-gray-600">{viewingItem.createdBy}</p>
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

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Engagement</h4>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>{viewingItem.likes} likes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span>{viewingItem.comments} comments</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO Info */}
              {(viewingItem.metaTitle || viewingItem.metaDescription || viewingItem.seoKeywords?.length) && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">SEO Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {viewingItem.metaTitle && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900">Meta Title</h4>
                          <p className="text-sm text-gray-600">{viewingItem.metaTitle}</p>
                        </div>
                      )}
                      
                      {viewingItem.metaDescription && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900">Meta Description</h4>
                          <p className="text-sm text-gray-600">{viewingItem.metaDescription}</p>
                        </div>
                      )}
                      
                      {viewingItem.seoKeywords && viewingItem.seoKeywords.length > 0 && (
                        <div className="space-y-2 md:col-span-2">
                          <h4 className="font-medium text-gray-900">SEO Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                            {viewingItem.seoKeywords.map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-gray-600 border-gray-300 px-2 py-1">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
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
