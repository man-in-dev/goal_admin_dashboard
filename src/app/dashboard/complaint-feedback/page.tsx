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
import { 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  AlertTriangle,
  MessageSquare,
  Lightbulb,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Building,
  Wrench,
  GraduationCap,
  MoreHorizontal
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formApi, ComplaintFeedback as ApiComplaintFeedback } from '@/lib/api';

interface ComplaintFeedback {
  _id: string;
  isGoalStudent: boolean;
  uid?: string;
  rollNo?: string;
  name: string;
  course?: string;
  phone: string;
  email: string;
  type: 'complaint' | 'feedback' | 'suggestion';
  department: string;
  message: string;
  attachment?: string;
  attachmentAlt?: string;
  status: 'pending' | 'in_review' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export default function ComplaintFeedbackPage() {
  const [complaintsFeedback, setComplaintsFeedback] = useState<ComplaintFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<ComplaintFeedback | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch complaints and feedback from API
  const fetchComplaintsFeedback = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 100
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await formApi.getComplaintFeedbackForms(params);
      setComplaintsFeedback(response.data.complaintsFeedback || []);
    } catch (error) {
      console.error('Error fetching complaints and feedback:', error);
      toast({
        title: "Error",
        description: "Failed to fetch complaints and feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchComplaintsFeedback();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [statusFilter, typeFilter, searchTerm]);

  // No need for client-side filtering since we're doing it on the server
  const filteredData = complaintsFeedback;

  const getTypeIcon = (type: string) => {
    const typeConfig = {
      complaint: { icon: AlertTriangle, color: 'text-red-600' },
      feedback: { icon: MessageSquare, color: 'text-blue-600' },
      suggestion: { icon: Lightbulb, color: 'text-yellow-600' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig];
    const Icon = config.icon;
    
    return <Icon className={`h-4 w-4 ${config.color}`} />;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      complaint: { 
        className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100', 
        iconColor: 'text-red-600' 
      },
      feedback: { 
        className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100', 
        iconColor: 'text-blue-600' 
      },
      suggestion: { 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100', 
        iconColor: 'text-yellow-600' 
      }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig];
    
    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${config.className}`}>
        <span className={config.iconColor}>{getTypeIcon(type)}</span>
        <span className="font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
        icon: Clock,
        iconColor: 'text-yellow-600'
      },
      in_review: { 
        className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
        icon: AlertCircle,
        iconColor: 'text-blue-600'
      },
      resolved: { 
        className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
        icon: CheckCircle,
        iconColor: 'text-green-600'
      },
      closed: { 
        className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
        icon: XCircle,
        iconColor: 'text-red-600'
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${config.className}`}>
        <Icon className={`h-3 w-3 ${config.iconColor}`} />
        <span className="font-medium">
          {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
        </span>
      </Badge>
    );
  };



  const handleViewItem = (item: ComplaintFeedback) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const handleEditItem = (item: ComplaintFeedback) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await formApi.deleteComplaintFeedbackForm(id);
        toast({
          title: "Item deleted",
          description: "The item has been successfully deleted.",
        });
        // Refresh the data
        fetchComplaintsFeedback();
      } catch (error) {
        console.error('Error deleting item:', error);
        toast({
          title: "Error",
          description: "Failed to delete item",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdateItem = async (updatedItem: Partial<ComplaintFeedback>) => {
    if (!selectedItem) return;
    
    try {
      await formApi.updateComplaintFeedbackForm(selectedItem._id, updatedItem);
      setIsEditDialogOpen(false);
      setSelectedItem(null);
      toast({
        title: "Item updated",
        description: "The item has been successfully updated.",
      });
      // Refresh the data
      fetchComplaintsFeedback();
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading complaints and feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Complaints & Feedback</h1>
          <p className="text-gray-600">Manage complaints, feedback, and suggestions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complaintsFeedback.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complaints</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {complaintsFeedback.filter(item => item.type === 'complaint').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {complaintsFeedback.filter(item => item.type === 'feedback').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suggestions</CardTitle>
            <Lightbulb className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {complaintsFeedback.filter(item => item.type === 'suggestion').length}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="complaint">Complaint</SelectItem>
                <SelectItem value="feedback">Feedback</SelectItem>
                <SelectItem value="suggestion">Suggestion</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Complaints & Feedback ({filteredData.length})</CardTitle>
          <CardDescription>Manage and track all complaints, feedback, and suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
             <TableBody>
               {filteredData.map((item) => (
                 <TableRow key={item._id}>
                   <TableCell>{getTypeBadge(item.type)}</TableCell>
                   <TableCell>
                     <div className="flex flex-col space-y-1">
                       <Badge 
                         variant="outline" 
                         className={`text-xs font-medium ${
                           item.isGoalStudent 
                             ? "bg-blue-100 text-blue-800 border-blue-200" 
                             : "bg-gray-100 text-gray-800 border-gray-200"
                         }`}
                       >
                         {item.isGoalStudent ? "Goal Student" : "General User"}
                       </Badge>
                       {item.isGoalStudent && (
                         <div className="text-xs text-gray-500">
                           {item.uid && `UID: ${item.uid}`}
                           {item.rollNo && ` | Roll: ${item.rollNo}`}
                         </div>
                       )}
                     </div>
                   </TableCell>
                   <TableCell className="font-medium">
                     <div>
                       <div className="font-semibold">{item.name}</div>
                       <div className="text-sm text-gray-500">{item.email}</div>
                       {item.course && (
                         <div className="text-xs text-gray-400">{item.course}</div>
                       )}
                     </div>
                   </TableCell>
                   <TableCell>
                     <div className="text-sm">{item.department}</div>
                   </TableCell>
                   <TableCell>{getStatusBadge(item.status)}</TableCell>
                   <TableCell>
                     <div className="text-sm">
                       {new Date(item.createdAt).toLocaleDateString()}
                     </div>
                   </TableCell>
                   <TableCell>
                     <div className="flex items-center space-x-1">
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => handleViewItem(item)}
                         title="View Details"
                       >
                         <Eye className="h-4 w-4" />
                       </Button>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => handleEditItem(item)}
                         title="Edit"
                       >
                         <Edit className="h-4 w-4" />
                       </Button>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => handleDeleteItem(item._id)}
                         title="Delete"
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                     </div>
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Details</DialogTitle>
            <DialogDescription>
              View complete information
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedItem.name}</h3>
                  <p className="text-sm text-gray-500">{selectedItem.email}</p>
                </div>
                <div className="flex gap-2">
                  {getTypeBadge(selectedItem.type)}
                  {getStatusBadge(selectedItem.status)}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Student Type</Label>
                    <div className="mt-1">
                      <Badge 
                        variant="outline"
                        className={`font-medium ${
                          selectedItem.isGoalStudent 
                            ? "bg-blue-100 text-blue-800 border-blue-200" 
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        }`}
                      >
                        {selectedItem.isGoalStudent ? "Goal Student" : "General User"}
                      </Badge>
                    </div>
                  </div>
                  
                  {selectedItem.isGoalStudent && (
                    <>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">UID</Label>
                        <p className="text-sm text-gray-900 font-medium">{selectedItem.uid || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Roll Number</Label>
                        <p className="text-sm text-gray-900 font-medium">{selectedItem.rollNo || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Course</Label>
                        <p className="text-sm text-gray-900 font-medium">{selectedItem.course || "-"}</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Phone</Label>
                    <p className="text-sm text-gray-900 font-medium">{selectedItem.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Department</Label>
                    <p className="text-sm text-gray-900 font-medium">{selectedItem.department}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Submitted</Label>
                    <p className="text-sm text-gray-900 font-medium">
                      {new Date(selectedItem.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                    <p className="text-sm text-gray-900 font-medium">
                      {new Date(selectedItem.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Section */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Message</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {selectedItem.message}
                  </p>
                </div>
              </div>

              {/* Attachment Section */}
              {selectedItem.attachment && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Attachment</Label>
                  <div className="mt-2">
                    <a
                      href={selectedItem.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="font-medium">
                        {selectedItem.attachmentAlt || 'View Attachment'}
                      </span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

       {/* Edit Dialog */}
       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle>Edit Item</DialogTitle>
             <DialogDescription>
               Update status and type
             </DialogDescription>
           </DialogHeader>
           {selectedItem && (
             <EditItemForm
               item={selectedItem}
               onSave={handleUpdateItem}
               onCancel={() => setIsEditDialogOpen(false)}
             />
           )}
         </DialogContent>
       </Dialog>

     </div>
   );
 }


// Edit Item Form Component
function EditItemForm({ 
  item, 
  onSave, 
  onCancel 
}: { 
  item: ComplaintFeedback; 
  onSave: (data: Partial<ComplaintFeedback>) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    status: item.status,
    type: item.type
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as any})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value as any})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="complaint">Complaint</SelectItem>
              <SelectItem value="feedback">Feedback</SelectItem>
              <SelectItem value="suggestion">Suggestion</SelectItem>
            </SelectContent>
          </Select>
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
