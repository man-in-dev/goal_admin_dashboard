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
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formApi, CareerCounselling } from '@/lib/api';
import { handleCSVDownload, generateFilename } from '@/lib/csv-utils';

export default function CareerCounsellingPage() {
  const [counsellings, setCounsellings] = useState<CareerCounselling[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCounselling, setSelectedCounselling] = useState<CareerCounselling | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<CareerCounselling>>({});

  // Fetch career counselling requests from API
  const fetchCounsellings = async () => {
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
      
      const response = await formApi.getCareerCounsellings(params);
      setCounsellings(response.data.counsellings || []);
    } catch (error) {
      console.error('Error fetching career counselling requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch career counselling requests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCounsellings();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [statusFilter, searchTerm]);

  const filteredCounsellings = counsellings;

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      contacted: { variant: 'default' as const, icon: AlertCircle, color: 'text-blue-600' },
      counselled: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      closed: { variant: 'destructive' as const, icon: AlertCircle, color: 'text-red-600' }
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

  const handleViewCounselling = (counselling: CareerCounselling) => {
    setSelectedCounselling(counselling);
    setEditFormData(counselling);
    setIsViewDialogOpen(true);
  };

  const handleEditCounselling = (counselling: CareerCounselling) => {
    setSelectedCounselling(counselling);
    setEditFormData({ ...counselling });
    setIsEditDialogOpen(true);
  };

  const handleDeleteCounselling = async (id: string) => {
    if (confirm('Are you sure you want to delete this career counselling request?')) {
      try {
        await formApi.deleteCareerCounselling(id);
        toast({
          title: "Request deleted",
          description: "The career counselling request has been successfully deleted.",
        });
        // Refresh the list
        fetchCounsellings();
      } catch (error) {
        console.error('Error deleting career counselling request:', error);
        toast({
          title: "Error",
          description: "Failed to delete career counselling request",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdateCounselling = async (updatedData: Partial<CareerCounselling>) => {
    if (!selectedCounselling) return;
    
    try {
      await formApi.updateCareerCounselling(selectedCounselling._id, updatedData);
      setIsEditDialogOpen(false);
      setSelectedCounselling(null);
      toast({
        title: "Request updated",
        description: "The career counselling request has been successfully updated.",
      });
      // Refresh the list
      fetchCounsellings();
    } catch (error) {
      console.error('Error updating career counselling request:', error);
      toast({
        title: "Error",
        description: "Failed to update career counselling request",
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
        () => formApi.downloadCareerCounsellingCSV(params),
        generateFilename('career-counselling'),
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
          <p className="mt-2 text-gray-600">Loading career counselling requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Career Counselling Requests</h1>
          <p className="text-gray-600">Manage student career counselling registrations</p>
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
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counsellings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {counsellings.filter(c => c.status === 'pending').length}
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
              {counsellings.filter(c => c.status === 'contacted').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Counselled</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {counsellings.filter(c => c.status === 'counselled').length}
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
                  placeholder="Search by student name, mobile, city..."
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
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="counselled">Counselled</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Career Counselling Requests</CardTitle>
          <CardDescription>
            Total: {filteredCounsellings.length} requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Mobile No</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Exam Prep</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCounsellings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No career counselling requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCounsellings.map((counselling) => (
                    <TableRow key={counselling._id}>
                      <TableCell className="font-medium">{counselling.studentName}</TableCell>
                      <TableCell>{counselling.mobileNo}</TableCell>
                      <TableCell>{counselling.class}</TableCell>
                      <TableCell>{counselling.city}</TableCell>
                      <TableCell>{counselling.examPreparation}</TableCell>
                      <TableCell>{getStatusBadge(counselling.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog open={isViewDialogOpen && selectedCounselling?._id === counselling._id} onOpenChange={setIsViewDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewCounselling(counselling)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Career Counselling Details</DialogTitle>
                              </DialogHeader>
                              {selectedCounselling && (
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-sm font-semibold">Student Name</Label>
                                    <p className="text-sm">{selectedCounselling.studentName}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-semibold">Mobile Number</Label>
                                    <p className="text-sm">{selectedCounselling.mobileNo}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-semibold">Class</Label>
                                    <p className="text-sm">{selectedCounselling.class}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-semibold">City</Label>
                                    <p className="text-sm">{selectedCounselling.city}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-semibold">Institute</Label>
                                    <p className="text-sm">{selectedCounselling.institute}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-semibold">Exam Preparation</Label>
                                    <p className="text-sm">{selectedCounselling.examPreparation}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-semibold">Status</Label>
                                    <p className="text-sm">{getStatusBadge(selectedCounselling.status)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-semibold">Submitted</Label>
                                    <p className="text-sm">{new Date(selectedCounselling.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Dialog open={isEditDialogOpen && selectedCounselling?._id === counselling._id} onOpenChange={setIsEditDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditCounselling(counselling)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Update Career Counselling</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="status">Status</Label>
                                  <Select
                                    value={editFormData.status || ''}
                                    onValueChange={(value) => setEditFormData({ ...editFormData, status: value as any })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="contacted">Contacted</SelectItem>
                                      <SelectItem value="counselled">Counselled</SelectItem>
                                      <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="notes">Admin Notes</Label>
                                  <Textarea
                                    id="notes"
                                    placeholder="Add notes about this counselling request..."
                                    value={editFormData.notes || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                                    rows={4}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleUpdateCounselling(editFormData)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                  >
                                    Update
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => setIsEditDialogOpen(false)}
                                    className="flex-1"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCounselling(counselling._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
