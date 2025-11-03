"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { QuillEditor } from "@/components/ui/quill-editor";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { publicNoticeApi, PublicNotice } from "@/lib/api";

export default function PublicNoticesPage() {
  const stripHtml = (html: string) => {
    if (!html) return '';
    const tmp = typeof window !== 'undefined' ? document.createElement('div') : null;
    if (!tmp) return html;
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };
  const [notices, setNotices] = useState<PublicNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedNotice, setSelectedNotice] = useState<PublicNotice | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    publishDate: new Date().toISOString().split('T')[0],
    downloadLink: "",
    isActive: true,
    isPublished: false,
    priority: "medium" as "low" | "medium" | "high",
    category: "general" as "exam" | "admission" | "general" | "academic" | "other",
    tags: [] as string[],
  });

  // Fetch notices
  const fetchNotices = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 100,
      };

      if (searchTerm) params.search = searchTerm;
      if (categoryFilter !== "all") params.category = categoryFilter;
      if (priorityFilter !== "all") params.priority = priorityFilter;
      if (statusFilter !== "all") {
        if (statusFilter === "published") params.isPublished = true;
        if (statusFilter === "draft") params.isPublished = false;
        if (statusFilter === "active") params.isActive = true;
        if (statusFilter === "inactive") params.isActive = false;
      }

      const response = await publicNoticeApi.getPublicNotices(params);
      setNotices(response.data.notices || []);
    } catch (error) {
      console.error("Error fetching notices:", error);
      toast({
        title: "Error",
        description: "Failed to fetch public notices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotices();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter, priorityFilter, statusFilter]);

  // Initial load
  useEffect(() => {
    fetchNotices();
  }, []);

  // Filter notices
  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           notice.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || notice.category === categoryFilter;
      const matchesPriority = priorityFilter === "all" || notice.priority === priorityFilter;
      
      let matchesStatus = true;
      if (statusFilter === "published") matchesStatus = notice.isPublished;
      if (statusFilter === "draft") matchesStatus = !notice.isPublished;
      if (statusFilter === "active") matchesStatus = notice.isActive;
      if (statusFilter === "inactive") matchesStatus = !notice.isActive;

      return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
    });
  }, [notices, searchTerm, categoryFilter, priorityFilter, statusFilter]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedNotice) {
        // Update existing notice
        await publicNoticeApi.updatePublicNotice(selectedNotice._id, formData);
        toast({
          title: "Success",
          description: "Public notice updated successfully",
        });
        setIsEditDialogOpen(false);
      } else {
        // Create new notice
        await publicNoticeApi.createPublicNotice(formData);
        toast({
          title: "Success",
          description: "Public notice created successfully",
        });
        setIsCreateDialogOpen(false);
      }

      resetForm();
      fetchNotices();
    } catch (error) {
      console.error("Error saving notice:", error);
      toast({
        title: "Error",
        description: "Failed to save public notice",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;

    try {
      await publicNoticeApi.deletePublicNotice(id);
      toast({
        title: "Success",
        description: "Public notice deleted successfully",
      });
      fetchNotices();
    } catch (error) {
      console.error("Error deleting notice:", error);
      toast({
        title: "Error",
        description: "Failed to delete public notice",
        variant: "destructive",
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      publishDate: new Date().toISOString().split('T')[0],
      downloadLink: "",
      isActive: true,
      isPublished: false,
      priority: "medium",
      category: "general",
      tags: [],
    });
    setSelectedNotice(null);
  };

  // Handle edit
  const handleEdit = (notice: PublicNotice) => {
    setSelectedNotice(notice);
    setFormData({
      title: notice.title,
      description: notice.description,
      publishDate: notice.publishDate.split('T')[0],
      downloadLink: notice.downloadLink || "",
      isActive: notice.isActive,
      isPublished: notice.isPublished,
      priority: notice.priority,
      category: notice.category,
      tags: notice.tags,
    });
    setIsEditDialogOpen(true);
  };

  // Handle view
  const handleView = (notice: PublicNotice) => {
    setSelectedNotice(notice);
    setIsViewDialogOpen(true);
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="default">Medium</Badge>;
      case "low":
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  // Get category badge
  const getCategoryBadge = (category: string) => {
    const colors = {
      exam: "bg-blue-100 text-blue-800",
      admission: "bg-green-100 text-green-800",
      general: "bg-gray-100 text-gray-800",
      academic: "bg-purple-100 text-purple-800",
      other: "bg-orange-100 text-orange-800",
    };
    return (
      <Badge className={colors[category as keyof typeof colors] || colors.other}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Public Notices</h1>
          <p className="text-gray-600 mt-1">
            Manage public notices and announcements
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Notice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Public Notice</DialogTitle>
              <DialogDescription>
                Add a new public notice or announcement
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <QuillEditor
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="Write the notice description..."
                  className="min-h-[200px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="publishDate">Publish Date</Label>
                  <Input
                    id="publishDate"
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="admission">Admission</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="downloadLink">Download Link (Optional)</Label>
                  <Input
                    id="downloadLink"
                    type="url"
                    value={formData.downloadLink}
                    onChange={(e) => setFormData({ ...formData, downloadLink: e.target.value })}
                    placeholder="https://example.com/document.pdf"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                  />
                  <Label htmlFor="isPublished">Published</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Notice"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search notices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
                <SelectItem value="admission">Admission</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Public Notices ({filteredNotices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Publish Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotices.map((notice) => (
                  <TableRow key={notice._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{notice.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-[300px]">
                          {stripHtml(notice.description)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryBadge(notice.category)}</TableCell>
                    <TableCell>{getPriorityBadge(notice.priority)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {notice.isPublished ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" />
                            Draft
                          </Badge>
                        )}
                        {!notice.isActive && (
                          <Badge variant="destructive">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(notice.publishDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(notice)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(notice)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notice._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Public Notice</DialogTitle>
            <DialogDescription>
              Update the public notice details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <QuillEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Write the notice description..."
                className="min-h-[200px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-publishDate">Publish Date</Label>
                <Input
                  id="edit-publishDate"
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="admission">Admission</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-downloadLink">Download Link (Optional)</Label>
                <Input
                  id="edit-downloadLink"
                  type="url"
                  value={formData.downloadLink}
                  onChange={(e) => setFormData({ ...formData, downloadLink: e.target.value })}
                  placeholder="https://example.com/document.pdf"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                />
                <Label htmlFor="edit-isPublished">Published</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Notice"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedNotice?.title}</DialogTitle>
            <DialogDescription>
              Public notice details
            </DialogDescription>
          </DialogHeader>
          {selectedNotice && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <div
                  className="prose prose-sm max-w-none mt-1 text-gray-900"
                  dangerouslySetInnerHTML={{ __html: selectedNotice.description }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Category</Label>
                  <div className="mt-1">{getCategoryBadge(selectedNotice.category)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Priority</Label>
                  <div className="mt-1">{getPriorityBadge(selectedNotice.priority)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Publish Date</Label>
                  <p className="text-gray-900 mt-1">
                    {new Date(selectedNotice.publishDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <div className="mt-1 flex items-center gap-2">
                    {selectedNotice.isPublished ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        Draft
                      </Badge>
                    )}
                    {!selectedNotice.isActive && (
                      <Badge variant="destructive">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {selectedNotice.downloadLink && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Download Link</Label>
                  <a
                    href={selectedNotice.downloadLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline mt-1 block"
                  >
                    {selectedNotice.downloadLink}
                  </a>
                </div>
              )}
              {selectedNotice.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedNotice.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Created By</Label>
                  <p className="text-gray-900 mt-1">
                    {selectedNotice.createdBy?.name || 'System'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Created At</Label>
                  <p className="text-gray-900 mt-1">
                    {new Date(selectedNotice.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
