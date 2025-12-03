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
import { 
  Search, 
  Eye, 
  Trash2, 
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  FileText
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { admissionFormApi, AdmissionForm } from '@/lib/api';

export default function AdmissionFormsPage() {
  const [admissionForms, setAdmissionForms] = useState<AdmissionForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [selectedForm, setSelectedForm] = useState<AdmissionForm | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Fetch admission forms from API
  const fetchAdmissionForms = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: limit
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (classFilter !== 'all') {
        params.classSeekingAdmission = classFilter;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await admissionFormApi.getAdmissionForms(params);
      // Handle nested data structure from API response
      const responseData = response.data?.data || response.data || response;
      setAdmissionForms(responseData.admissionForms || []);
      setTotalPages(responseData.pagination?.pages || 1);
      setTotal(responseData.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching admission forms:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admission forms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search
      fetchAdmissionForms();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [statusFilter, classFilter, searchTerm]);

  useEffect(() => {
    fetchAdmissionForms();
  }, [currentPage]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600', label: 'Pending' },
      under_review: { variant: 'default' as const, icon: AlertCircle, color: 'text-blue-600', label: 'Under Review' },
      approved: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600', label: 'Approved' },
      rejected: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600', label: 'Rejected' },
      admitted: { variant: 'default' as const, icon: GraduationCap, color: 'text-purple-600', label: 'Admitted' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleViewForm = async (id: string) => {
    try {
      const response = await admissionFormApi.getAdmissionFormById(id);
      // Handle nested data structure from API response
      const responseData = response.data?.data || response.data || response;
      setSelectedForm(responseData);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error('Error fetching admission form:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admission form details.",
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await admissionFormApi.updateAdmissionFormStatus(id, newStatus);
      toast({
        title: "Success",
        description: "Status updated successfully",
      });
      fetchAdmissionForms();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteForm = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admission form? This action cannot be undone.')) {
      return;
    }
    
    try {
      await admissionFormApi.deleteAdmissionForm(id);
      toast({
        title: "Success",
        description: "Admission form deleted successfully",
      });
      fetchAdmissionForms();
    } catch (error) {
      console.error('Error deleting admission form:', error);
      toast({
        title: "Error",
        description: "Failed to delete admission form",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    // Get all forms for export (without pagination)
    const exportData = async () => {
      try {
        const params: any = {
          page: 1,
          limit: 10000 // Large limit to get all
        };
        
        if (statusFilter !== 'all') {
          params.status = statusFilter;
        }
        
        if (classFilter !== 'all') {
          params.classSeekingAdmission = classFilter;
        }
        
        if (searchTerm) {
          params.search = searchTerm;
        }
        
        const response = await admissionFormApi.getAdmissionForms(params);
        // Handle nested data structure from API response
        const responseData = response.data?.data || response.data || response;
        const forms = responseData.admissionForms || [];
        
        // Convert to CSV
        const headers = [
          'Application No', 'Name', 'Email', 'Phone', 'Gender', 'Date of Birth',
          'Class Seeking Admission', 'Previous Class', 'Previous School',
          'Status', 'Created At'
        ];
        
        const rows = forms.map((form: AdmissionForm) => [
          form.applicationNo || '',
          form.name,
          form.email,
          form.phone,
          form.gender,
          form.dateOfBirth,
          form.classSeekingAdmission,
          form.previousClass,
          form.previousSchool,
          form.status,
          new Date(form.createdAt).toLocaleString()
        ]);
        
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admission-forms-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Success",
          description: "CSV file downloaded successfully",
        });
      } catch (error) {
        console.error('Error exporting CSV:', error);
        toast({
          title: "Error",
          description: "Failed to export CSV file",
          variant: "destructive",
        });
      }
    };
    
    exportData();
  };

  // Get unique classes for filter
  const uniqueClasses = Array.from(new Set(admissionForms.map(form => form.classSeekingAdmission))).sort();

  // Calculate stats
  const stats = {
    total: total,
    pending: admissionForms.filter(f => f.status === 'pending').length,
    underReview: admissionForms.filter(f => f.status === 'under_review').length,
    approved: admissionForms.filter(f => f.status === 'approved').length,
    rejected: admissionForms.filter(f => f.status === 'rejected').length,
    admitted: admissionForms.filter(f => f.status === 'admitted').length,
  };

  if (loading && admissionForms.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading admission forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Online Admission Forms</h1>
          <p className="text-gray-600">Manage student admission form submissions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={fetchAdmissionForms} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.underReview}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admitted</CardTitle>
            <GraduationCap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.admitted}</div>
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
                  placeholder="Search by name, email, phone, or application number..."
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
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="admitted">Admitted</SelectItem>
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {uniqueClasses.map((className) => (
                  <SelectItem key={className} value={className}>
                    {className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Admission Forms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Admission Forms ({total})</CardTitle>
          <CardDescription>View and manage student admission form submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : admissionForms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No admission forms found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admissionForms.map((form) => (
                      <TableRow key={form._id}>
                        <TableCell className="font-medium">
                          {form.applicationNo || 'N/A'}
                        </TableCell>
                        <TableCell>{form.name}</TableCell>
                        <TableCell>{form.email}</TableCell>
                        <TableCell>{form.phone}</TableCell>
                        <TableCell>{form.classSeekingAdmission}</TableCell>
                        <TableCell>
                          <Select
                            value={form.status}
                            onValueChange={(value) => handleStatusUpdate(form._id, value)}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="under_review">Under Review</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="admitted">Admitted</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {new Date(form.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewForm(form._id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteForm(form._id)}
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
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Form Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Admission Form Details</DialogTitle>
            <DialogDescription>
              Complete information for admission form submission
            </DialogDescription>
          </DialogHeader>
          {selectedForm && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-sm text-gray-600">{selectedForm.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-gray-600">{selectedForm.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm text-gray-600">{selectedForm.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Alternate Contact (WhatsApp)</Label>
                    <p className="text-sm text-gray-600">{selectedForm.alternateContact}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Gender</Label>
                    <p className="text-sm text-gray-600 capitalize">{selectedForm.gender}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Date of Birth</Label>
                    <p className="text-sm text-gray-600">{selectedForm.dateOfBirth}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <p className="text-sm text-gray-600">{selectedForm.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Nationality</Label>
                    <p className="text-sm text-gray-600">{selectedForm.nationality}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium">Address</Label>
                    <p className="text-sm text-gray-600">{selectedForm.address}</p>
                  </div>
                  {selectedForm.pinCode && (
                    <div>
                      <Label className="text-sm font-medium">Pin Code</Label>
                      <p className="text-sm text-gray-600">{selectedForm.pinCode}</p>
                    </div>
                  )}
                  {selectedForm.applicationNo && (
                    <div>
                      <Label className="text-sm font-medium">Application Number</Label>
                      <p className="text-sm text-gray-600 font-medium">{selectedForm.applicationNo}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Parent/Guardian Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Parent/Guardian Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Father's Name</Label>
                    <p className="text-sm text-gray-600">{selectedForm.fatherName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Father's Mobile</Label>
                    <p className="text-sm text-gray-600">{selectedForm.fatherMobile}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Father's WhatsApp</Label>
                    <p className="text-sm text-gray-600">{selectedForm.fatherWhatsApp}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Father's Occupation</Label>
                    <p className="text-sm text-gray-600">{selectedForm.fatherOccupation}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Mother's Name</Label>
                    <p className="text-sm text-gray-600">{selectedForm.motherName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Mother's Mobile</Label>
                    <p className="text-sm text-gray-600">{selectedForm.motherMobile}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Mother's Occupation</Label>
                    <p className="text-sm text-gray-600">{selectedForm.motherOccupation}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Annual Family Income</Label>
                    <p className="text-sm text-gray-600">{selectedForm.annualFamilyIncome}</p>
                  </div>
                  {selectedForm.guardianName && (
                    <>
                      <div>
                        <Label className="text-sm font-medium">Guardian's Name</Label>
                        <p className="text-sm text-gray-600">{selectedForm.guardianName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Guardian's Mobile</Label>
                        <p className="text-sm text-gray-600">{selectedForm.guardianMobile}</p>
                      </div>
                      {selectedForm.guardianRelationship && (
                        <div>
                          <Label className="text-sm font-medium">Guardian Relationship</Label>
                          <p className="text-sm text-gray-600">{selectedForm.guardianRelationship}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Academic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Previous Class</Label>
                    <p className="text-sm text-gray-600">{selectedForm.previousClass}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Previous School</Label>
                    <p className="text-sm text-gray-600">{selectedForm.previousSchool}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Previous Board</Label>
                    <p className="text-sm text-gray-600">{selectedForm.previousBoard}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Previous Year</Label>
                    <p className="text-sm text-gray-600">{selectedForm.previousYear}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Previous Marks</Label>
                    <p className="text-sm text-gray-600">{selectedForm.previousMarks}</p>
                  </div>
                  {selectedForm.previousGrade && (
                    <div>
                      <Label className="text-sm font-medium">Previous Grade</Label>
                      <p className="text-sm text-gray-600">{selectedForm.previousGrade}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium">Class Seeking Admission</Label>
                    <p className="text-sm text-gray-600 font-medium">{selectedForm.classSeekingAdmission}</p>
                  </div>
                </div>
              </div>

              {/* Test Preferences */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Test Preferences</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Preferred Test Date</Label>
                    <p className="text-sm text-gray-600">{selectedForm.preferredTestDate}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Preferred Test Centre</Label>
                    <p className="text-sm text-gray-600">{selectedForm.preferredTestCentre}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              {(selectedForm.passportPhoto || selectedForm.reportCard || selectedForm.birthCertificate || selectedForm.idProof) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Documents</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedForm.passportPhoto && (
                      <div>
                        <Label className="text-sm font-medium">Passport Photo</Label>
                        <div className="mt-2">
                          <a 
                            href={selectedForm.passportPhoto} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Photo
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedForm.reportCard && (
                      <div>
                        <Label className="text-sm font-medium">Report Card</Label>
                        <div className="mt-2">
                          <a 
                            href={selectedForm.reportCard} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Document
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedForm.birthCertificate && (
                      <div>
                        <Label className="text-sm font-medium">Birth Certificate</Label>
                        <div className="mt-2">
                          <a 
                            href={selectedForm.birthCertificate} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Document
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedForm.idProof && (
                      <div>
                        <Label className="text-sm font-medium">ID Proof</Label>
                        <div className="mt-2">
                          <a 
                            href={selectedForm.idProof} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Document
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status and Dates */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Status & Dates</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedForm.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created At</Label>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedForm.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedForm.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

