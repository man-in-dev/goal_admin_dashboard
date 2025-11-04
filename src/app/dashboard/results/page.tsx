"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { resultApi, Result } from '@/lib/api';
import { Upload, Download, Search, Filter, Trash2, Eye, Edit, Plus, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    course: 'all',
    batch: 'all',
    branch: '',
    testDate: '',
    testType: 'all',
    batchYear: '',
    sortBy: 'testDate',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [editForm, setEditForm] = useState<Partial<Result>>({});

  // Fetch results
  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await resultApi.getResults({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        course: filters.course === 'all' ? '' : filters.course,
        batch: filters.batch === 'all' ? '' : filters.batch,
        testType: filters.testType === 'all' ? '' : filters.testType,
        batchYear: filters.batchYear ? parseInt(filters.batchYear) : undefined
      });

      if (response.success) {
        setResults(response.data.results);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages
        }));
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await resultApi.getResultStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchResults();
    fetchStats();
  }, [pagination.page, filters]);

  // Handle CSV upload
  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a CSV file');
      return;
    }

    try {
      setUploading(true);
      const response = await resultApi.uploadCSVResults(selectedFile, 'admin');
      
      if (response.success) {
        toast.success(`Successfully uploaded ${response.data.insertedCount} results`);
        setUploadDialogOpen(false);
        setSelectedFile(null);
        fetchResults();
        fetchStats();
      } else {
        toast.error(response.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this result?')) return;

    try {
      const response = await resultApi.deleteResult(id);
      if (response.success) {
        toast.success('Result deleted successfully');
        fetchResults();
        fetchStats();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete result');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedResults.length === 0) {
      toast.error('Please select results to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedResults.length} results?`)) return;

    try {
      const response = await resultApi.deleteMultipleResults(selectedResults);
      if (response.success) {
        toast.success(`${response.data.deletedCount} results deleted successfully`);
        setSelectedResults([]);
        fetchResults();
        fetchStats();
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete results');
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedResults(results.map(result => result._id));
    } else {
      setSelectedResults([]);
    }
  };

  // Handle individual select
  const handleSelectResult = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedResults(prev => [...prev, id]);
    } else {
      setSelectedResults(prev => prev.filter(resultId => resultId !== id));
    }
  };

  // Handle view result
  const handleView = (result: Result) => {
    setSelectedResult(result);
    setViewDialogOpen(true);
  };

  // Handle edit result
  const handleEdit = (result: Result) => {
    setSelectedResult(result);
    setEditForm(result);
    setEditDialogOpen(true);
  };

  // Handle update result
  const handleUpdate = async () => {
    if (!selectedResult) return;

    try {
      const response = await resultApi.updateResult(selectedResult._id, editForm);
      if (response.success) {
        toast.success('Result updated successfully');
        setEditDialogOpen(false);
        setSelectedResult(null);
        setEditForm({});
        fetchResults();
        fetchStats();
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update result');
    }
  };

  // Handle delete result with confirmation
  const handleDeleteWithConfirmation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this result? This action cannot be undone.')) return;
    await handleDelete(id);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Results Management</h1>
          <p className="text-muted-foreground">Manage student test results and upload CSV files</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload CSV
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Results CSV</DialogTitle>
              <DialogDescription>
                Upload a CSV file containing student results. Required columns:
                <br />
                <strong>COURSE, TEST DATE, RANK, ROLL NO, STUDENT NAME, TQ, TA, TR, TW, TL, PR, PW, CR, CW, BR, BW, Total MARKS, MARKS%, W%, PERCENTILE, BATCH, BRANCH</strong>
                <br />
                <br />
                Optional columns (will be auto-generated if not provided):
                <br />
                <strong>TEST TYPE, EXAM ID, BATCH YEAR, BATCH CODE, TOTAL STUDENTS</strong>
                <br />
                <a 
                  href="/sample-results.csv" 
                  download 
                  className="text-blue-600 hover:underline mt-2 inline-block"
                >
                  <Download className="w-4 h-4 inline mr-1" />
                  Download sample CSV template
                </a>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="csv-file">CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
              {selectedFile && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleFileUpload} disabled={!selectedFile || uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Results</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.todayResults || 0} added today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Marks</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMarks?.toFixed(1) || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.avgPercentage?.toFixed(1) || 0}% average
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Percentile</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgPercentile?.toFixed(1) || 0}</div>
              <p className="text-xs text-muted-foreground">
                Across all courses
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.courses?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.batches?.length || 0} batches
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search students..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="testType">Test Type</Label>
              <Select value={filters.testType} onValueChange={(value) => setFilters(prev => ({ ...prev, testType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="CLASSROOM_TEST">Classroom Test</SelectItem>
                  <SelectItem value="SURPRISE_TEST">Surprise Test</SelectItem>
                  <SelectItem value="MOCK_TEST">Mock Test</SelectItem>
                  <SelectItem value="FINAL_TEST">Final Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="course">Course</Label>
              <Select value={filters.course} onValueChange={(value) => setFilters(prev => ({ ...prev, course: value === "all" ? "" : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All courses</SelectItem>
                  {stats?.courses?.map((course: string) => (
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="batch">Batch</Label>
              <Select value={filters.batch} onValueChange={(value) => setFilters(prev => ({ ...prev, batch: value === "all" ? "" : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All batches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All batches</SelectItem>
                  {stats?.batches?.map((batch: string) => (
                    <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="batchYear">Batch Year</Label>
              <Input
                id="batchYear"
                type="number"
                placeholder="e.g., 2025"
                value={filters.batchYear}
                onChange={(e) => setFilters(prev => ({ ...prev, batchYear: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="sortBy">Sort By</Label>
              <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="testDate">Test Date</SelectItem>
                  <SelectItem value="rank">Rank</SelectItem>
                  <SelectItem value="totalMarks">Total Marks</SelectItem>
                  <SelectItem value="marksPercentage">Percentage</SelectItem>
                  <SelectItem value="percentile">Percentile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => setFilters({
                search: '',
                course: 'all',
                batch: 'all',
                branch: '',
                testDate: '',
                testType: 'all',
                batchYear: '',
                sortBy: 'testDate',
                sortOrder: 'desc'
              })}>
                <Filter className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedResults.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedResults.length} result(s) selected
              </span>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>
            Showing {results.length} of {pagination.total} results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading results...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedResults.length === results.length && results.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Test Type</TableHead>
                    <TableHead>Test Date</TableHead>
                    <TableHead>Total Marks</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Percentile</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result._id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedResults.includes(result._id)}
                          onChange={(e) => handleSelectResult(result._id, e.target.checked)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">#{result.rank}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{result.studentName}</TableCell>
                      <TableCell>{result.rollNo}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{result.course}</Badge>
                      </TableCell>
                      <TableCell>
                        {result.testType ? (
                          <Badge variant={result.testType === 'SURPRISE_TEST' ? 'destructive' : 'default'}>
                            {result.testType.replace('_', ' ')}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(result.testDate)}</TableCell>
                      <TableCell>{result.totalMarks}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{formatPercentage(result.marksPercentage)}</span>
                          <Progress value={result.marksPercentage} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={result.percentile >= 90 ? "default" : result.percentile >= 70 ? "secondary" : "outline"}>
                          {formatPercentage(result.percentile)}
                        </Badge>
                      </TableCell>
                      <TableCell>{result.batch}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleView(result)} title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(result)} title="Edit Result">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteWithConfirmation(result._id)} title="Delete Result">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Result Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Result Details</DialogTitle>
            <DialogDescription>
              Detailed view of student result
            </DialogDescription>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Student Name</Label>
                  <p className="text-lg font-semibold">{selectedResult.studentName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Roll Number</Label>
                  <p className="text-lg font-semibold">{selectedResult.rollNo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Course</Label>
                  <p className="text-lg font-semibold">{selectedResult.course}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Test Date</Label>
                  <p className="text-lg font-semibold">{formatDate(selectedResult.testDate)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Rank</Label>
                  <p className="text-lg font-semibold">#{selectedResult.rank}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Batch</Label>
                  <p className="text-lg font-semibold">{selectedResult.batch}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Branch</Label>
                  <p className="text-lg font-semibold">{selectedResult.branch}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Test Type</Label>
                  <p className="text-lg font-semibold">
                    {selectedResult.testType ? (
                      <Badge variant={selectedResult.testType === 'SURPRISE_TEST' ? 'destructive' : 'default'}>
                        {selectedResult.testType.replace('_', ' ')}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Not specified</span>
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Uploaded By</Label>
                  <p className="text-lg font-semibold">{selectedResult.uploadedBy}</p>
                </div>
                {selectedResult.examId && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Exam ID</Label>
                    <p className="text-lg font-semibold font-mono text-xs">{selectedResult.examId}</p>
                  </div>
                )}
                {selectedResult.batchYear && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Batch Year</Label>
                    <p className="text-lg font-semibold">{selectedResult.batchYear}</p>
                  </div>
                )}
                {selectedResult.totalStudents && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Total Students</Label>
                    <p className="text-lg font-semibold">Ranked {selectedResult.rank} out of {selectedResult.totalStudents}</p>
                  </div>
                )}
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <Label className="text-sm font-medium text-muted-foreground">Total Marks</Label>
                  <p className="text-2xl font-bold text-primary">{selectedResult.totalMarks}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Label className="text-sm font-medium text-muted-foreground">Marks Percentage</Label>
                  <p className="text-2xl font-bold text-green-600">{formatPercentage(selectedResult.marksPercentage)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Label className="text-sm font-medium text-muted-foreground">Percentile</Label>
                  <p className="text-2xl font-bold text-blue-600">{formatPercentage(selectedResult.percentile)}</p>
                </div>
              </div>

              {/* Question Analysis */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Question Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Overall Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Questions:</span>
                        <span className="font-medium">{selectedResult.tq}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Attempted:</span>
                        <span className="font-medium">{selectedResult.ta}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Correct:</span>
                        <span className="font-medium text-green-600">{selectedResult.tr}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Wrong:</span>
                        <span className="font-medium text-red-600">{selectedResult.tw}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Left:</span>
                        <span className="font-medium text-gray-600">{selectedResult.tl}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Subject-wise Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Physics (R/W):</span>
                        <span className="font-medium">{selectedResult.pr}/{selectedResult.pw}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chemistry (R/W):</span>
                        <span className="font-medium">{selectedResult.cr}/{selectedResult.cw}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Biology (R/W):</span>
                        <span className="font-medium">{selectedResult.br}/{selectedResult.bw}</span>
                      </div>
                      {selectedResult.zr !== undefined && selectedResult.zw !== undefined && (
                        <div className="flex justify-between">
                          <span>Zoology (R/W):</span>
                          <span className="font-medium">{selectedResult.zr}/{selectedResult.zw}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Additional Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span>Wrong Percentage:</span>
                    <span className="font-medium text-red-600">{formatPercentage(selectedResult.wPercentage)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span className="font-medium">{formatDate(selectedResult.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Result Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Result</DialogTitle>
            <DialogDescription>
              Update student result information
            </DialogDescription>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-studentName">Student Name</Label>
                  <Input
                    id="edit-studentName"
                    value={editForm.studentName || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, studentName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-rollNo">Roll Number</Label>
                  <Input
                    id="edit-rollNo"
                    value={editForm.rollNo || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, rollNo: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-course">Course</Label>
                  <Input
                    id="edit-course"
                    value={editForm.course || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, course: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-testDate">Test Date</Label>
                  <Input
                    id="edit-testDate"
                    type="date"
                    value={editForm.testDate ? new Date(editForm.testDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, testDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-rank">Rank</Label>
                  <Input
                    id="edit-rank"
                    type="number"
                    value={editForm.rank || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, rank: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-testType">Test Type</Label>
                  <Select
                    value={editForm.testType || 'CLASSROOM_TEST'}
                    onValueChange={(value: 'CLASSROOM_TEST' | 'SURPRISE_TEST' | 'MOCK_TEST' | 'FINAL_TEST') =>
                      setEditForm(prev => ({ ...prev, testType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLASSROOM_TEST">Classroom Test</SelectItem>
                      <SelectItem value="SURPRISE_TEST">Surprise Test</SelectItem>
                      <SelectItem value="MOCK_TEST">Mock Test</SelectItem>
                      <SelectItem value="FINAL_TEST">Final Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-batch">Batch</Label>
                  <Input
                    id="edit-batch"
                    value={editForm.batch || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, batch: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-batchYear">Batch Year</Label>
                  <Input
                    id="edit-batchYear"
                    type="number"
                    value={editForm.batchYear || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, batchYear: e.target.value ? parseInt(e.target.value) : undefined }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-batchCode">Batch Code</Label>
                  <Input
                    id="edit-batchCode"
                    value={editForm.batchCode || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, batchCode: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-branch">Branch</Label>
                  <Input
                    id="edit-branch"
                    value={editForm.branch || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, branch: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-examId">Exam ID</Label>
                  <Input
                    id="edit-examId"
                    value={editForm.examId || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, examId: e.target.value }))}
                    placeholder="Auto-generated if empty"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-totalStudents">Total Students</Label>
                  <Input
                    id="edit-totalStudents"
                    type="number"
                    value={editForm.totalStudents || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, totalStudents: e.target.value ? parseInt(e.target.value) : undefined }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-totalMarks">Total Marks</Label>
                  <Input
                    id="edit-totalMarks"
                    type="number"
                    value={editForm.totalMarks || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, totalMarks: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-marksPercentage">Marks Percentage</Label>
                  <Input
                    id="edit-marksPercentage"
                    type="number"
                    step="0.01"
                    value={editForm.marksPercentage || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, marksPercentage: parseFloat(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-percentile">Percentile</Label>
                  <Input
                    id="edit-percentile"
                    type="number"
                    step="0.01"
                    value={editForm.percentile || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, percentile: parseFloat(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-wPercentage">Wrong Percentage</Label>
                  <Input
                    id="edit-wPercentage"
                    type="number"
                    step="0.01"
                    value={editForm.wPercentage || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, wPercentage: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate}>
                  Update Result
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
