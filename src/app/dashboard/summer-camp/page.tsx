"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Eye, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Download,
  Users,
  Calendar,
  MapPin,
  Trophy
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { summerCampApi, SummerCampRegistration } from '@/lib/api';
import { SummerCampDetailsModal } from '@/components/dashboard/summer-camp/summer-camp-details-modal';

export default function SummerCampPage() {
  const [registrations, setRegistrations] = useState<SummerCampRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRegistration, setSelectedRegistration] = useState<SummerCampRegistration | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const limit = 10;

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: limit
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await summerCampApi.getRegistrations(params);
      const responseData = response.data;
      setRegistrations(responseData.registrations || []);
      setTotalPages(responseData.totalPages || 1);
      setTotal(responseData.total || 0);
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

  const fetchStats = async () => {
    try {
      const response = await summerCampApi.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
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
    fetchStats();
  }, [currentPage]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await summerCampApi.updateRegistrationStatus(id, newStatus);
      toast({
        title: "Success",
        description: `Status updated to ${newStatus}`,
      });
      fetchRegistrations();
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this registration?')) return;
    
    try {
      await summerCampApi.deleteRegistration(id);
      toast({
        title: "Success",
        description: "Registration deleted successfully",
      });
      fetchRegistrations();
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete registration",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Roll Number', 'Student Name', 'Father Name', 'Mobile', 'Category', 'Gender',
      'Class', 'School', 'Exam Center', 'Status', 'Registered On'
    ];
    
    const rows = registrations.map(reg => [
      reg.rollNumber,
      reg.studentName,
      reg.fatherName,
      reg.studentMobile,
      reg.category,
      reg.gender,
      reg.currentClass,
      reg.schoolName,
      reg.examCenter,
      reg.status,
      new Date(reg.createdAt).toLocaleString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summer-camp-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600', label: 'Pending' },
      approved: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600', label: 'Approved' },
      rejected: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600', label: 'Rejected' },
      attended: { variant: 'default' as const, icon: Trophy, color: 'text-purple-600', label: 'Attended' }
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Summer Camp 2026</h1>
          <p className="text-gray-600">Manage student registrations for Summer Camp program</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={fetchRegistrations} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 italic">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-600 font-bold uppercase text-[10px] tracking-widest">Total Registrations</CardDescription>
            <CardTitle className="text-3xl font-black text-blue-900">{stats?.total || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-[10px] text-blue-400 font-bold">
              <Users className="h-3 w-3 mr-1" /> ACTIVE APPLICANTS
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-600 font-bold uppercase text-[10px] tracking-widest">Approved</CardDescription>
            <CardTitle className="text-3xl font-black text-green-900">{stats?.approved || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-[10px] text-green-400 font-bold">
              <CheckCircle className="h-3 w-3 mr-1" /> SEATS RESERVED
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-yellow-600 font-bold uppercase text-[10px] tracking-widest">Pending Review</CardDescription>
            <CardTitle className="text-3xl font-black text-yellow-900">{stats?.pending || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-[10px] text-yellow-400 font-bold">
              <Clock className="h-3 w-3 mr-1" /> AWAITING ACTION
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-600 font-bold uppercase text-[10px] tracking-widest">Attended</CardDescription>
            <CardTitle className="text-3xl font-black text-purple-900">{stats?.attended || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-[10px] text-purple-400 font-bold">
              <Trophy className="h-3 w-3 mr-1" /> PROGRAM COMPLETED
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by Name, Roll No or Mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 border-gray-200 focus:ring-blue-500"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 h-10 border-gray-200">
                <SelectValue placeholder="Status Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="attended">Attended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-sm border-gray-100 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="font-bold text-gray-700">Roll No</TableHead>
                <TableHead className="font-bold text-gray-700">Student Detail</TableHead>
                <TableHead className="font-bold text-gray-700">Exam Center</TableHead>
                <TableHead className="font-bold text-gray-700">Contact</TableHead>
                <TableHead className="font-bold text-gray-700">Status</TableHead>
                <TableHead className="font-bold text-gray-700">Registered</TableHead>
                <TableHead className="text-right font-bold text-gray-700 px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500 opacity-20" />
                  </TableCell>
                </TableRow>
              ) : registrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center text-gray-400 italic">
                    No registrations found.
                  </TableCell>
                </TableRow>
              ) : (
                registrations.map((reg) => (
                  <TableRow key={reg._id} className="hover:bg-blue-50/30 transition-colors">
                    <TableCell>
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">{reg.rollNumber}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{reg.studentName}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-medium">{reg.gender} • Class {reg.currentClass}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-xs text-gray-600">
                        <MapPin className="h-3 w-3 mr-1 text-red-400" />
                        {reg.examCenter}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="font-medium text-gray-700">{reg.studentMobile}</span>
                        <span className="text-gray-400">P: {reg.parentMobile}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={reg.status} 
                        onValueChange={(val) => handleStatusUpdate(reg._id, val)}
                      >
                        <SelectTrigger className="w-32 h-8 text-[11px] font-bold border-none bg-transparent focus:ring-0 p-0 shadow-none">
                          <SelectValue>{getStatusBadge(reg.status)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="attended">Attended</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {new Date(reg.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:bg-blue-100 rounded-full"
                          onClick={() => {
                            setSelectedRegistration(reg);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:bg-red-100 rounded-full"
                          onClick={() => handleDelete(reg._id)}
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
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 py-4 bg-gray-50/30 border-t">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-xs font-bold text-gray-500">
                PAGE {currentPage} OF {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <SummerCampDetailsModal 
        registration={selectedRegistration}
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
      />
    </div>
  );
}
