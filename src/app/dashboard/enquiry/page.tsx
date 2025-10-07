"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  HelpCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formApi, EnquiryForm as ApiEnquiryForm } from '@/lib/api';
import { handleCSVDownload, generateFilename } from '@/lib/csv-utils';

interface EnquiryForm {
  _id: string;
  name: string;
  phone: string;
  email: string;
  studying: string;
  course: string;
  state: string;
  district: string;
  address: string;
  query: string;
  countryCode: string;
  status: 'pending' | 'contacted' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export default function EnquiryFormsPage() {
  const [enquiries, setEnquiries] = useState<EnquiryForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryForm | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch enquiries from API
  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 100
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await formApi.getEnquiryForms(params);
      setEnquiries(response.data.enquiries || []);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch enquiries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEnquiries();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [statusFilter, searchTerm]);

  // No need for client-side filtering since we're doing it on the server
  const filteredEnquiries = enquiries;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      contacted: { variant: 'default' as const, icon: AlertCircle, color: 'text-blue-600' },
      resolved: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      closed: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };


  const handleViewEnquiry = (enquiry: EnquiryForm) => {
    setSelectedEnquiry(enquiry);
    setIsViewDialogOpen(true);
  };

  const handleEditEnquiry = (enquiry: EnquiryForm) => {
    setSelectedEnquiry(enquiry);
    setIsEditDialogOpen(true);
  };

  const handleDeleteEnquiry = async (id: string) => {
    if (confirm('Are you sure you want to delete this enquiry?')) {
      try {
        await formApi.deleteEnquiryForm(id);
        toast({
          title: "Enquiry deleted",
          description: "The enquiry has been successfully deleted.",
        });
        // Refresh the enquiries list
        fetchEnquiries();
      } catch (error) {
        console.error('Error deleting enquiry:', error);
        toast({
          title: "Error",
          description: "Failed to delete enquiry",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdateEnquiry = async (updatedEnquiry: Partial<EnquiryForm>) => {
    if (!selectedEnquiry) return;
    
    try {
      await formApi.updateEnquiryForm(selectedEnquiry._id, updatedEnquiry);
      setIsEditDialogOpen(false);
      setSelectedEnquiry(null);
      toast({
        title: "Enquiry updated",
        description: "The enquiry has been successfully updated.",
      });
      // Refresh the enquiries list
      fetchEnquiries();
    } catch (error) {
      console.error('Error updating enquiry:', error);
      toast({
        title: "Error",
        description: "Failed to update enquiry",
        variant: "destructive",
      });
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      await handleCSVDownload(
        () => formApi.downloadEnquiriesCSV(params),
        generateFilename('enquiries'),
        (error) => {
          toast({
            title: "Download Error",
            description: "Failed to download CSV file. Please try again.",
            variant: "destructive",
          });
        }
      );

      toast({
        title: "Download Started",
        description: "CSV file download has started.",
      });
    } catch (error) {
      console.error('Error downloading CSV:', error);
      toast({
        title: "Error",
        description: "Failed to download CSV file",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading enquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enquiry Forms</h1>
          <p className="text-gray-600">Manage student enquiries and course inquiries</p>
        </div>
        <Button onClick={handleDownloadCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enquiries</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enquiries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {enquiries.filter(e => e.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacted</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {enquiries.filter(e => e.status === 'contacted').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {enquiries.filter(e => e.status === 'resolved').length}
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
                  placeholder="Search enquiries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enquiries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Enquiries ({filteredEnquiries.length})</CardTitle>
          <CardDescription>Manage and track student enquiries</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Studying</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>State</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnquiries.map((enquiry) => (
                <TableRow key={enquiry._id}>
                  <TableCell className="font-medium">{enquiry.name}</TableCell>
                  <TableCell>{enquiry.countryCode} {enquiry.phone}</TableCell>
                  <TableCell>{enquiry.email}</TableCell>
                  <TableCell>{enquiry.studying}</TableCell>
                  <TableCell>{enquiry.course}</TableCell>
                  <TableCell>{enquiry.state}</TableCell>
                  <TableCell>{enquiry.district}</TableCell>
                  <TableCell>{getStatusBadge(enquiry.status)}</TableCell>
                  <TableCell>{new Date(enquiry.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewEnquiry(enquiry)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEnquiry(enquiry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEnquiry(enquiry._id)}
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

      {/* View Enquiry Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
            <DialogDescription>
              View complete enquiry information
            </DialogDescription>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-gray-600">{selectedEnquiry.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-gray-600">{selectedEnquiry.countryCode} {selectedEnquiry.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-600">{selectedEnquiry.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Studying</Label>
                  <p className="text-sm text-gray-600">{selectedEnquiry.studying}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Course</Label>
                  <p className="text-sm text-gray-600">{selectedEnquiry.course}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">State</Label>
                  <p className="text-sm text-gray-600">{selectedEnquiry.state}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">District</Label>
                  <p className="text-sm text-gray-600">{selectedEnquiry.district}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedEnquiry.status)}</div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Address</Label>
                <p className="text-sm text-gray-600 mt-1 p-3 bg-gray-50 rounded-md">
                  {selectedEnquiry.address}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Query</Label>
                <p className="text-sm text-gray-600 mt-1 p-3 bg-gray-50 rounded-md">
                  {selectedEnquiry.query}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedEnquiry.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedEnquiry.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Enquiry Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Enquiry</DialogTitle>
            <DialogDescription>
              Update enquiry status and add notes
            </DialogDescription>
          </DialogHeader>
          {selectedEnquiry && (
            <EditEnquiryForm
              enquiry={selectedEnquiry}
              onSave={handleUpdateEnquiry}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Edit Enquiry Form Component
function EditEnquiryForm({ 
  enquiry, 
  onSave, 
  onCancel 
}: { 
  enquiry: EnquiryForm; 
  onSave: (data: Partial<EnquiryForm>) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    status: enquiry.status
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as any})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
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
