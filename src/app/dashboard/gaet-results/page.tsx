"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, Search, FileText, AlertCircle, CheckCircle, X, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { gaetResultsApi, GAETResult } from '@/lib/api';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function GAETResultsPage() {
  const [results, setResults] = useState<GAETResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewData, setPreviewData] = useState<GAETResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<GAETResult | null>(null);
  const [editForm, setEditForm] = useState<Partial<GAETResult>>({});
  const [selectedResults, setSelectedResults] = useState<string[]>([]);

  // Parse CSV file
  const parseCSV = (file: File): Promise<GAETResult[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const parsedData: GAETResult[] = results.data.map((row: any) => {
              return {
                rollNo: row['ROLL NO']?.toString().trim() || '',
                studentName: row['STUDENT NAME']?.toString().trim() || '',
                testName: row['TEST NAME']?.toString().trim() || '',
                tq: parseInt(row['TQ']?.toString() || '0') || 0,
                tr: parseInt(row['TR']?.toString() || '0') || 0,
                tw: parseInt(row['TW']?.toString() || '0') || 0,
                tl: parseInt(row['TL']?.toString() || '0') || 0,
                pr: parseInt(row['PR']?.toString() || '0') || 0,
                pw: parseInt(row['PW']?.toString() || '0') || 0,
                cr: parseInt(row['CR']?.toString() || '0') || 0,
                cw: parseInt(row['CW']?.toString() || '0') || 0,
                mr: parseInt(row['MR']?.toString() || '0') || 0,
                mw: parseInt(row['MW']?.toString() || '0') || 0,
                br: parseInt(row['BR']?.toString() || '0') || 0,
                bw: parseInt(row['BW']?.toString() || '0') || 0,
                gkr: parseInt(row['GKR']?.toString() || '0') || 0,
                gkw: parseInt(row['GKW']?.toString() || '0') || 0,
                totalMarks: parseFloat(row['T MARKS']?.toString() || '0') || 0,
                marksPercentage: parseFloat(row['MARKS%']?.toString() || '0') || 0,
                scholarship: row['SCH']?.toString().trim() || '',
                specialDiscount: row['SPL DISC']?.toString().trim() || '',
                totalFeeOneTime: parseFloat(row['TOTAL FEE(ONE TIME)']?.toString() || '0') || 0,
                scholarshipAmount: parseFloat(row['SCH AMOUNT']?.toString() || '0') || 0,
                totalFeeInstallment: parseFloat(row['TOTAL FEE (INS)']?.toString() || '0') || 0,
                // Note: If SCH AMOUNT appears twice in CSV, the second one is for installment
                scholarshipAmountInstallment: parseFloat(row['SCH AMOUNT (INS)']?.toString() || row['SCH AMOUNT']?.toString() || '0') || 0,
                testDate: row['TEST DATE']?.toString().trim() || '',
                testCenter: row['TEST CENTER']?.toString().trim() || '',
                remarks: row['REMARKS']?.toString().trim() || '',
              };
            }).filter((result: GAETResult) => result.rollNo && result.studentName);
            resolve(parsedData);
          } catch (error) {
            reject(new Error('Failed to parse CSV file'));
          }
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  };

  // Handle file selection and preview
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setSelectedFile(file);
    
    try {
      const parsed = await parseCSV(file);
      setPreviewData(parsed.slice(0, 10)); // Show first 10 rows as preview
      toast.success(`CSV parsed successfully. Found ${parsed.length} records.`);
    } catch (error) {
      toast.error('Failed to parse CSV file');
      console.error(error);
    }
  };

  // Handle CSV upload
  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a CSV file');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to API
      const response = await gaetResultsApi.uploadCSVGAETResults(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        toast.success(`Successfully uploaded ${response.data?.insertedCount || response.data?.totalRows || 0} GAET results`);
        setUploadDialogOpen(false);
        setSelectedFile(null);
        setPreviewData([]);
        // Fetch results after upload
        fetchResults();
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || error.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Fetch results from API
  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await gaetResultsApi.getGAETResults({
        limit: 1000, // Get all results for now
      });
      if (response.success) {
        setResults(response.data?.results || response.data?.data || []);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  // Fetch results on mount
  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter results based on search term
  const filteredResults = results.filter((result) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      result.rollNo.toLowerCase().includes(searchLower) ||
      result.studentName.toLowerCase().includes(searchLower) ||
      result.testName.toLowerCase().includes(searchLower) ||
      (result.testCenter && result.testCenter.toLowerCase().includes(searchLower))
    );
  });

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle view result
  const handleView = (result: GAETResult) => {
    setSelectedResult(result);
    setViewDialogOpen(true);
  };

  // Handle edit result
  const handleEdit = (result: GAETResult) => {
    setSelectedResult(result);
    setEditForm(result);
    setEditDialogOpen(true);
  };

  // Handle update result
  const handleUpdate = async () => {
    if (!selectedResult || !selectedResult._id) return;

    try {
      const response = await gaetResultsApi.updateGAETResult(selectedResult._id, editForm);
      if (response.success) {
        toast.success('GAET result updated successfully');
        setEditDialogOpen(false);
        setSelectedResult(null);
        setEditForm({});
        fetchResults();
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to update result');
    }
  };

  // Handle delete result
  const handleDelete = async (id: string) => {
    try {
      const response = await gaetResultsApi.deleteGAETResult(id);
      if (response.success) {
        toast.success('GAET result deleted successfully');
        fetchResults();
      } else {
        throw new Error(response.message || 'Delete failed');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to delete result');
    }
  };

  // Handle delete with confirmation
  const handleDeleteWithConfirmation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this GAET result? This action cannot be undone.')) return;
    await handleDelete(id);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedResults.length === 0) {
      toast.error('Please select results to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedResults.length} GAET result(s)? This action cannot be undone.`)) return;

    try {
      const response = await gaetResultsApi.deleteMultipleGAETResults(selectedResults);
      if (response.success) {
        toast.success(`${response.data?.deletedCount || selectedResults.length} GAET result(s) deleted successfully`);
        setSelectedResults([]);
        fetchResults();
      } else {
        throw new Error(response.message || 'Bulk delete failed');
      }
    } catch (error: any) {
      console.error('Bulk delete error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to delete results');
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedResults(filteredResults.map(result => result._id!).filter(Boolean));
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">GAET Results Management</h1>
          <p className="text-muted-foreground">Upload and manage GAET test results from CSV files</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload CSV
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload GAET Results CSV</DialogTitle>
              <DialogDescription>
                Upload a CSV file containing GAET results. Required columns:
                <br />
                <strong>
                  ROLL NO, STUDENT NAME, TEST NAME, TQ, TR, TW, TL, PR, PW, CR, CW, MR, MW, BR, BW, GKR, GKW, T MARKS, MARKS%, SCH, SPL DISC, TOTAL FEE(ONE TIME), SCH AMOUNT, TOTAL FEE (INS), SCH AMOUNT, TEST DATE, TEST CENTER, REMARKS
                </strong>
                <br />
                <br />
                <a 
                  href="/sample-gaet-results.csv" 
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
                  onChange={handleFileSelect}
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
              {previewData.length > 0 && (
                <div className="space-y-2">
                  <Label>Preview (First 10 rows)</Label>
                  <div className="border rounded-lg overflow-auto max-h-64">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Roll No</TableHead>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Test Name</TableHead>
                          <TableHead>Total Marks</TableHead>
                          <TableHead>Marks %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{row.rollNo}</TableCell>
                            <TableCell>{row.studentName}</TableCell>
                            <TableCell>{row.testName}</TableCell>
                            <TableCell>{row.totalMarks}</TableCell>
                            <TableCell>{row.marksPercentage.toFixed(2)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setUploadDialogOpen(false);
                  setSelectedFile(null);
                  setPreviewData([]);
                }}>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Results</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredResults.length} visible
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Marks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {results.length > 0
                ? (results.reduce((sum, r) => sum + r.totalMarks, 0) / results.length).toFixed(1)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {results.length > 0
                ? (results.reduce((sum, r) => sum + r.marksPercentage, 0) / results.length).toFixed(1)
                : 0}% average
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Tests</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(results.map(r => r.testName)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Different test names
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Centers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(results.map(r => r.testCenter).filter(Boolean)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique centers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by roll number, student name, test name, or test center..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
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
          <CardTitle>GAET Results</CardTitle>
          <CardDescription>
            Showing {filteredResults.length} of {results.length} results
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
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No results uploaded yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Upload a CSV file to get started
              </p>
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload CSV
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedResults.length === filteredResults.length && filteredResults.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Test Date</TableHead>
                    <TableHead>Test Center</TableHead>
                    <TableHead>Total Marks</TableHead>
                    <TableHead>Marks %</TableHead>
                    <TableHead>Correct/Wrong</TableHead>
                    <TableHead>Scholarship</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result, idx) => (
                    <TableRow key={result._id || idx}>
                      <TableCell>
                        <Checkbox
                          checked={selectedResults.includes(result._id!)}
                          onCheckedChange={(checked) => result._id && handleSelectResult(result._id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{result.rollNo}</TableCell>
                      <TableCell>{result.studentName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{result.testName}</Badge>
                      </TableCell>
                      {/* <TableCell>{formatDate(result.testDate)}</TableCell> */}
                      <TableCell>{result.testDate}</TableCell>
                      <TableCell>{result.testCenter || 'N/A'}</TableCell>
                      <TableCell>{result.totalMarks}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{result.marksPercentage.toFixed(2)}%</span>
                          <Progress value={result.marksPercentage} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-green-600">{result.tr}</span> /{' '}
                        <span className="text-red-600">{result.tw}</span>
                      </TableCell>
                      <TableCell>
                        {result.scholarship ? (
                          <Badge variant="secondary">{result.scholarship}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleView(result)} title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(result)} title="Edit Result">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => result._id && handleDeleteWithConfirmation(result._id)} title="Delete Result">
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
        </CardContent>
      </Card>

      {/* View Result Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>GAET Result Details</DialogTitle>
            <DialogDescription>
              Detailed view of student GAET result
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
                  <Label className="text-sm font-medium text-muted-foreground">Test Name</Label>
                  <p className="text-lg font-semibold">{selectedResult.testName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Test Date</Label>
                  <p className="text-lg font-semibold">{formatDate(selectedResult.testDate)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Test Center</Label>
                  <p className="text-lg font-semibold">{selectedResult.testCenter || 'N/A'}</p>
                </div>
                {selectedResult.scholarship && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Scholarship</Label>
                    <p className="text-lg font-semibold">
                      <Badge variant="secondary">{selectedResult.scholarship}</Badge>
                    </p>
                  </div>
                )}
                {selectedResult.specialDiscount && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Special Discount</Label>
                    <p className="text-lg font-semibold">{selectedResult.specialDiscount}</p>
                  </div>
                )}
                {selectedResult.remarks && (
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground">Remarks</Label>
                    <p className="text-lg font-semibold">{selectedResult.remarks}</p>
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
                  <p className="text-2xl font-bold text-green-600">{selectedResult.marksPercentage.toFixed(2)}%</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Label className="text-sm font-medium text-muted-foreground">Total Questions</Label>
                  <p className="text-2xl font-bold text-blue-600">{selectedResult.tq}</p>
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
                        <span>Math (R/W):</span>
                        <span className="font-medium">{selectedResult.mr}/{selectedResult.mw}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Biology (R/W):</span>
                        <span className="font-medium">{selectedResult.br}/{selectedResult.bw}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GK (R/W):</span>
                        <span className="font-medium">{selectedResult.gkr}/{selectedResult.gkw}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fee Information */}
              {(selectedResult.totalFeeOneTime || selectedResult.totalFeeInstallment) && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Fee Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedResult.totalFeeOneTime && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Total Fee (One Time)</Label>
                        <p className="text-lg font-semibold">{formatCurrency(selectedResult.totalFeeOneTime)}</p>
                        {selectedResult.scholarshipAmount && (
                          <p className="text-sm text-muted-foreground">
                            Scholarship: {formatCurrency(selectedResult.scholarshipAmount)}
                          </p>
                        )}
                      </div>
                    )}
                    {selectedResult.totalFeeInstallment && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Total Fee (Installment)</Label>
                        <p className="text-lg font-semibold">{formatCurrency(selectedResult.totalFeeInstallment)}</p>
                        {selectedResult.scholarshipAmountInstallment && (
                          <p className="text-sm text-muted-foreground">
                            Scholarship: {formatCurrency(selectedResult.scholarshipAmountInstallment)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              {(selectedResult.createdAt || selectedResult.updatedAt) && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Timestamps</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedResult.createdAt && (
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span className="font-medium">{formatDate(selectedResult.createdAt)}</span>
                      </div>
                    )}
                    {selectedResult.updatedAt && (
                      <div className="flex justify-between">
                        <span>Updated:</span>
                        <span className="font-medium">{formatDate(selectedResult.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Result Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit GAET Result</DialogTitle>
            <DialogDescription>
              Update student GAET result information
            </DialogDescription>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-rollNo">Roll Number</Label>
                  <Input
                    id="edit-rollNo"
                    value={editForm.rollNo || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, rollNo: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-studentName">Student Name</Label>
                  <Input
                    id="edit-studentName"
                    value={editForm.studentName || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, studentName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-testName">Test Name</Label>
                  <Input
                    id="edit-testName"
                    value={editForm.testName || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, testName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-testDate">Test Date</Label>
                  <Input
                    id="edit-testDate"
                    type="text"
                    value={editForm.testDate || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, testDate: e.target.value }))}
                    placeholder="YYYY-MM-DD"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-testCenter">Test Center</Label>
                  <Input
                    id="edit-testCenter"
                    value={editForm.testCenter || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, testCenter: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-scholarship">Scholarship</Label>
                  <Input
                    id="edit-scholarship"
                    value={editForm.scholarship || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, scholarship: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-specialDiscount">Special Discount</Label>
                  <Input
                    id="edit-specialDiscount"
                    value={editForm.specialDiscount || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, specialDiscount: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-totalMarks">Total Marks</Label>
                  <Input
                    id="edit-totalMarks"
                    type="number"
                    value={editForm.totalMarks || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, totalMarks: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-marksPercentage">Marks Percentage</Label>
                  <Input
                    id="edit-marksPercentage"
                    type="number"
                    step="0.01"
                    value={editForm.marksPercentage || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, marksPercentage: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-tq">Total Questions</Label>
                  <Input
                    id="edit-tq"
                    type="number"
                    value={editForm.tq || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, tq: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-tr">Total Right</Label>
                  <Input
                    id="edit-tr"
                    type="number"
                    value={editForm.tr || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, tr: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-tw">Total Wrong</Label>
                  <Input
                    id="edit-tw"
                    type="number"
                    value={editForm.tw || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, tw: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-tl">Total Left</Label>
                  <Input
                    id="edit-tl"
                    type="number"
                    value={editForm.tl || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, tl: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-pr">Physics Right</Label>
                  <Input
                    id="edit-pr"
                    type="number"
                    value={editForm.pr || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, pr: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-pw">Physics Wrong</Label>
                  <Input
                    id="edit-pw"
                    type="number"
                    value={editForm.pw || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, pw: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-cr">Chemistry Right</Label>
                  <Input
                    id="edit-cr"
                    type="number"
                    value={editForm.cr || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, cr: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-cw">Chemistry Wrong</Label>
                  <Input
                    id="edit-cw"
                    type="number"
                    value={editForm.cw || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, cw: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-mr">Math Right</Label>
                  <Input
                    id="edit-mr"
                    type="number"
                    value={editForm.mr || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, mr: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-mw">Math Wrong</Label>
                  <Input
                    id="edit-mw"
                    type="number"
                    value={editForm.mw || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, mw: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-br">Biology Right</Label>
                  <Input
                    id="edit-br"
                    type="number"
                    value={editForm.br || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, br: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-bw">Biology Wrong</Label>
                  <Input
                    id="edit-bw"
                    type="number"
                    value={editForm.bw || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bw: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-gkr">GK Right</Label>
                  <Input
                    id="edit-gkr"
                    type="number"
                    value={editForm.gkr || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, gkr: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-gkw">GK Wrong</Label>
                  <Input
                    id="edit-gkw"
                    type="number"
                    value={editForm.gkw || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, gkw: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-totalFeeOneTime">Total Fee (One Time)</Label>
                  <Input
                    id="edit-totalFeeOneTime"
                    type="number"
                    value={editForm.totalFeeOneTime || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, totalFeeOneTime: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-scholarshipAmount">Scholarship Amount</Label>
                  <Input
                    id="edit-scholarshipAmount"
                    type="number"
                    value={editForm.scholarshipAmount || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, scholarshipAmount: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-totalFeeInstallment">Total Fee (Installment)</Label>
                  <Input
                    id="edit-totalFeeInstallment"
                    type="number"
                    value={editForm.totalFeeInstallment || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, totalFeeInstallment: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-scholarshipAmountInstallment">Scholarship Amount (Installment)</Label>
                  <Input
                    id="edit-scholarshipAmountInstallment"
                    type="number"
                    value={editForm.scholarshipAmountInstallment || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, scholarshipAmountInstallment: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="edit-remarks">Remarks</Label>
                  <Textarea
                    id="edit-remarks"
                    value={editForm.remarks || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, remarks: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setEditDialogOpen(false);
                  setSelectedResult(null);
                  setEditForm({});
                }}>
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

