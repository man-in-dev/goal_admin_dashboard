"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { gvetAdminApi, GVETAnswerKey } from "@/lib/api";
import { AlertCircle, Calendar, Loader2, Search, Trash2, Eye } from "lucide-react";

export default function GVETAnswerKeysPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<GVETAnswerKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<GVETAnswerKey | null>(null);

  const pages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await gvetAdminApi.getAnswerKeys({ page, limit, search });
      if (res.success) {
        const payload = (res.data && (res.data.submissions ? res.data : res.data.data)) || res.data || {};
        setItems(payload?.submissions || []);
        setTotal(payload?.pagination?.total || 0);
      } else {
        toast({ title: "Error", description: res.message || "Failed to load data", variant: "destructive" });
      }
    } catch (err) {
      console.error("Error fetching GVET submissions", err);
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => { fetchData(); }, 300);
    return () => clearTimeout(t);
  }, [page, limit, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this submission?")) return;
    try {
      setDeletingId(id);
      const res = await gvetAdminApi.deleteAnswerKey(id);
      if (res.success) {
        toast({ title: "Deleted", description: "Submission removed" });
        fetchData();
      } else {
        toast({ title: "Error", description: res.message || "Delete failed", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Delete failed", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GVET Answer Key Submissions</h1>
          <p className="text-gray-600 mt-1">Review and manage GVET answer key suggestions</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, roll, phone, question no..."
                value={search}
                onChange={(e) => { setPage(1); setSearch(e.target.value); }}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submissions ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-600">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center py-14 text-gray-500">
              <AlertCircle className="w-5 h-5 mr-2" /> No submissions found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[220px]">Student</TableHead>
                    <TableHead>Question No</TableHead>
                    <TableHead>Explanation</TableHead>
                    <TableHead className="w-[160px]">Submitted At</TableHead>
                    <TableHead className="w-[120px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((it) => (
                    <TableRow key={it._id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="font-medium text-gray-900">{it.name}</div>
                          <div className="text-xs text-gray-600">Roll: {it.rollNo}</div>
                          <div className="text-xs text-gray-600">Phone: {it.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{it.questionNo}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-700 line-clamp-2 max-w-[520px]">
                          {it.explanation}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(it.createdAt).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewItem(it)}
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(it._id)}
                            disabled={deletingId === it._id}
                            className="text-red-600 hover:text-red-700"
                          >
                            {deletingId === it._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-gray-600">Page {page} of {pages}</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Prev</Button>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages}>Next</Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-600">Name</Label>
                <div className="mt-1 text-gray-900">{viewItem.name}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Roll No</Label>
                  <div className="mt-1 text-gray-900">{viewItem.rollNo}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Phone</Label>
                  <div className="mt-1 text-gray-900">{viewItem.phone}</div>
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Question No</Label>
                <div className="mt-1 text-gray-900">{viewItem.questionNo}</div>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Explanation</Label>
                <div className="mt-1 text-gray-900 whitespace-pre-wrap">{viewItem.explanation}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewItem(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


