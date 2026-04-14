"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SummerCampRegistration } from '@/lib/api';
import { Clock, CheckCircle, XCircle, UserCheck, MapPin, Phone, School, Calendar, Info } from 'lucide-react';

interface SummerCampDetailsModalProps {
  registration: SummerCampRegistration | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SummerCampDetailsModal({ registration, isOpen, onClose }: SummerCampDetailsModalProps) {
  if (!registration) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600', label: 'Pending' },
      approved: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600', label: 'Approved' },
      rejected: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600', label: 'Rejected' },
      attended: { variant: 'default' as const, icon: UserCheck, color: 'text-purple-600', label: 'Attended' }
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold">Registration Details</DialogTitle>
              <DialogDescription>
                Roll Number: <span className="font-mono font-bold text-blue-600">{registration.rollNumber}</span>
              </DialogDescription>
            </div>
            <div className="mr-6">{getStatusBadge(registration.status)}</div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
          {/* Avatar / Photo */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-48 h-60 rounded-xl border-2 border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center shadow-inner">
              {registration.photograph ? (
                <img 
                  src={registration.photograph.startsWith('http') ? registration.photograph : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '')}${registration.photograph}`} 
                  alt={registration.studentName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <UserCheck className="h-12 w-12 mb-2 opacity-20" />
                  <span className="text-xs">No Photograph</span>
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg text-gray-900">{registration.studentName}</h3>
              <p className="text-sm text-gray-500">{registration.gender} • {registration.category}</p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-8">
            {/* Personal Info */}
            <section>
              <div className="flex items-center gap-2 mb-3 pb-1 border-b">
                <Info className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Personal Information</h4>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <Label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Father's Name</Label>
                  <p className="text-sm font-medium">{registration.fatherName}</p>
                </div>
                <div>
                  <Label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Father's Occupation</Label>
                  <p className="text-sm font-medium">{registration.fatherOccupation || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Date of Birth</Label>
                  <p className="text-sm font-medium">{registration.dob}</p>
                </div>
                <div>
                  <Label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">GTSE Roll Number</Label>
                  <p className="text-sm font-medium font-mono text-blue-700">{registration.gtseRollNumber || 'N/A'}</p>
                </div>
              </div>
            </section>

            {/* Contact Info */}
            <section>
              <div className="flex items-center gap-2 mb-3 pb-1 border-b">
                <Phone className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Contact Details</h4>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <Label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Student Mobile</Label>
                  <p className="text-sm font-medium">{registration.studentMobile}</p>
                  {registration.studentWhatsApp && (
                    <p className="text-[10px] text-green-600 font-medium italic">WA: {registration.studentWhatsApp}</p>
                  )}
                </div>
                <div>
                  <Label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Parent Mobile</Label>
                  <p className="text-sm font-medium">{registration.parentMobile}</p>
                  {registration.parentWhatsApp && (
                    <p className="text-[10px] text-green-600 font-medium italic">WA: {registration.parentWhatsApp}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Academic & Exam */}
            <section>
              <div className="flex items-center gap-2 mb-3 pb-1 border-b">
                <School className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Academic & Exam Preferences</h4>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <Label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Current Class</Label>
                  <p className="text-sm font-medium">{registration.currentClass}</p>
                </div>
                <div>
                  <Label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Exam Center</Label>
                  <p className="text-sm font-medium text-blue-700">{registration.examCenter}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">School Name</Label>
                  <p className="text-sm font-medium">{registration.schoolName}</p>
                </div>
              </div>
            </section>

            {/* Address */}
            <section>
              <div className="flex items-center gap-2 mb-3 pb-1 border-b">
                <MapPin className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Address</h4>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">{registration.address}</p>
                <div className="flex gap-4">
                   <p className="text-sm text-gray-600"><span className="font-bold text-gray-400">District:</span> {registration.district}</p>
                   <p className="text-sm text-gray-600"><span className="font-bold text-gray-400">State:</span> {registration.state}</p>
                   <p className="text-sm text-gray-600"><span className="font-bold text-gray-400">PIN:</span> {registration.pinCode}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t flex justify-between text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            <span>Registered On: {new Date(registration.createdAt).toLocaleString()}</span>
            <span>Last Updated: {new Date(registration.updatedAt).toLocaleString()}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
