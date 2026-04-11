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
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  School,
  Calendar
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { summerCampApi, SummerCampRegistration } from '@/lib/api';

export default function SummerCampPage() {
  const [registrations, setRegistrations] = useState<SummerCampRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReg, setSelectedReg] = useState<SummerCampRegistration | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: limit
      };
      
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      
      const response = await summerCampApi.getRegistrations(params);
      const data = response.data?.registrations || response.registrations || [];
      const pagination = response.data?.pagination || response.pagination || {};
      
      setRegistrations(data);
      setTotalPages(pagination.pages || 1);
      setTotal(pagination.total || 0);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch registrations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchRegistrations();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchRegistrations();
  }, [currentPage]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Pending' },
      contacted: { variant: 'default' as const, icon: Phone, label: 'Contacted' },
      resolved: { variant: 'default' as const, icon: CheckCircle, label: 'Resolved' },
      rejected: { variant: 'destructive' as const, icon: XCircle, label: 'Rejected' }
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

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await summerCampApi.updateStatus(id, newStatus);
      toast({ title: "Success", description: "Status updated successfully" });
      fetchRegistrations();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this registration?')) return;
    try {
      await summerCampApi.deleteRegistration(id);
      toast({ title: "Success", description: "Registration deleted successfully" });
      fetchRegistrations();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const handleExportCSV = () => {
    // Basic CSV export
    const headers = ['Roll No', 'Student Name', 'Father Name', 'Mobile', 'Class', 'Exam Center', 'Status', 'Date'];
    const rows = registrations.map(reg => [
      reg.rollNumber,
      reg.studentName,
      reg.fatherName,
      reg.studentMobile,
      reg.currentClass,
      reg.examCenter,
      reg.status,
      new Date(reg.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summer-camp-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Summer Camp 2026 Registrations</h1>
          <p className="text-gray-600">Track and manage Summer Camp applications</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={fetchRegistrations} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search by name, mobile, or roll number..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Roll No</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Exam Center</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {loading ? "Loading..." : "No registrations found"}
                </TableCell>
              </TableRow>
            ) : (
              registrations.map((reg) => (
                <TableRow key={reg._id}>
                  <TableCell className="font-mono">{reg.rollNumber}</TableCell>
                  <TableCell className="font-medium">{reg.studentName}</TableCell>
                  <TableCell>{reg.studentMobile}</TableCell>
                  <TableCell>{reg.currentClass}</TableCell>
                  <TableCell>{reg.examCenter}</TableCell>
                  <TableCell>
                    <Select value={reg.status} onValueChange={(val) => handleStatusUpdate(reg._id, val)}>
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedReg(reg); setIsViewDialogOpen(true); }}>
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(reg._id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="p-4 flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Previous</Button>
            <span className="py-1 px-3 bg-gray-100 rounded text-sm">Page {currentPage} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Next</Button>
          </div>
        )}
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registration Details - {selectedReg?.rollNumber}</DialogTitle>
          </DialogHeader>
          {selectedReg && (
            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-bold">Student Name</span>
                  <span className="font-medium">{selectedReg.studentName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-bold">Father's Name</span>
                  <span>{selectedReg.fatherName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-bold">Mobile Numbers</span>
                  <span>Student: {selectedReg.studentMobile}</span>
                  <span>Parent: {selectedReg.parentMobile}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-bold">Class & School</span>
                  <span>Class: {selectedReg.currentClass}</span>
                  <span>School: {selectedReg.schoolName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-bold">Exam Details</span>
                  <span>Center: {selectedReg.examCenter}</span>
                  <span>Date: 26-April-2026</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-bold">Photograph</span>
                  {selectedReg.photograph ? (
                    <img src={selectedReg.photograph.startsWith('http') ? selectedReg.photograph : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${selectedReg.photograph}`} alt="Student" className="w-32 h-40 object-cover rounded border mt-1" />
                  ) : (
                    <span className="text-gray-400 italic">No photo uploaded</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-bold">Address</span>
                  <span className="text-sm">{selectedReg.address}, {selectedReg.district}, {selectedReg.state} - {selectedReg.pinCode}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-bold">Submitted At</span>
                  <span className="text-sm">{new Date(selectedReg.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
