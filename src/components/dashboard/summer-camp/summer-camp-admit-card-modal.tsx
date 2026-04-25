"use client";

import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SummerCampRegistration } from '@/lib/api';
import { Download, User, MapPin, Calendar, Phone, Hash, Award, ShieldCheck } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface SummerCampAdmitCardModalProps {
  registration: SummerCampRegistration | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SummerCampAdmitCardModal({ registration, isOpen, onClose }: SummerCampAdmitCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!registration) return null;

  const handleDownload = async () => {
    if (cardRef.current === null) return;
    
    try {
      // Capture the card as a high-quality PNG first
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 });
      
      // Initialize jsPDF (A4 portrait)
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // Calculate height to maintain aspect ratio
      const imgProps = pdf.getImageProperties(dataUrl);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Add image to PDF (centered with a small top margin)
      pdf.addImage(dataUrl, 'PNG', 5, 10, pdfWidth - 10, imgHeight);
      pdf.save(`admit-card-${registration.rollNumber}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-slate-100 p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-4 bg-white border-b flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-lg font-bold text-slate-800">Preview Admit Card</DialogTitle>
          </div>
          <Button onClick={handleDownload} variant="default" className="bg-red-600 hover:bg-red-700 h-9 font-bold">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </DialogHeader>

        <div className="p-6 flex justify-center bg-slate-200/50 overflow-y-auto max-h-[80vh]">
          {/* THE CARD - Document Style */}
          <div 
            ref={cardRef}
            className="w-[700px] bg-white shadow-sm p-10 relative text-slate-900 border border-slate-300"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-10">
                {/* Left Side: Student Details */}
                <div className="col-span-8 space-y-5">
                    {/* Roll Number Header */}
                    <div className="mb-8">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Roll Number</label>
                        <h2 className="text-4xl font-black text-black tracking-tight leading-none">{registration.rollNumber}</h2>
                        <div className="h-px bg-slate-100 w-full mt-4" />
                    </div>

                    <div className="space-y-4">
                        <DetailRow label="Candidate Name" value={registration.studentName} />
                        <DetailRow label="Father's Name" value={registration.fatherName} />
                        
                        <div className="grid grid-cols-2 gap-8">
                            <DetailRow label="Gender" value={registration.gender} />
                            <DetailRow label="Present Class" value={registration.currentClass} />
                        </div>

                        <DetailRow label="Correspondence Address" value={registration.address} />

                        <div className="grid grid-cols-2 gap-8">
                            <DetailRow label="District" value={registration.district} />
                            <DetailRow label="State" value={registration.state} />
                        </div>

                        <DetailRow label="School Name" value={registration.schoolName} />
                        <DetailRow label="School Address" value={registration.schoolAddress || 'N/A'} />
                    </div>
                </div>

                {/* Right Side: Logo & Signature */}
                <div className="col-span-4 flex flex-col items-center pt-2">
                    {/* Logo Section */}
                    <div className="w-full aspect-square bg-white border border-slate-100 rounded-xl flex items-center justify-center p-4 mb-8 shadow-sm">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-blue-600 fill-current">
                            <path d="M20 20 L80 20 L80 35 L40 35 L40 50 L75 50 L75 65 L40 65 L40 85 L20 85 Z" />
                            <circle cx="75" cy="75" r="10" />
                        </svg>
                    </div>

                    {/* Official Stamp Box */}
                    <div className="w-32 h-16 border-2 border-slate-100 rounded-lg flex items-center justify-center bg-slate-50 mb-10 overflow-hidden">
                        <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter italic">Official Stamp</span>
                    </div>

                    {/* Authorized Signatory */}
                    <div className="mt-auto w-full text-center">
                        <div className="border-t border-black w-full mb-2" />
                        <p className="text-[10px] font-black uppercase text-black tracking-wider">Authorized Signatory</p>
                    </div>
                </div>
            </div>

            {/* Examination Details Box */}
            <div className="mt-10 bg-slate-50/80 border border-slate-100 rounded-2xl p-6">
                <h4 className="text-[11px] font-black uppercase text-black mb-4 border-b border-slate-200 pb-2 tracking-widest flex items-center justify-between">
                    Examination Details
                    <Award size={14} className="text-slate-400" />
                </h4>
                <div className="grid grid-cols-3 gap-8">
                    <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Test Date</label>
                        <p className="text-xs font-black text-black">26-April-2026 (Sunday)</p>
                    </div>
                    <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Reporting Time</label>
                        <p className="text-xs font-black text-black">09:00 AM</p>
                    </div>
                    <div className="col-span-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Test Venue</label>
                        <p className="text-xs font-black text-red-600">Goal Institute, Kankarbagh</p>
                        <p className="text-[9px] text-slate-500 font-medium leading-relaxed mt-1">{registration.examCenter}</p>
                    </div>
                </div>
            </div>

            {/* Candidate Signature Section */}
            <div className="mt-12 mb-8">
                <div className="w-48 border-b border-black mb-2" />
                <p className="text-[10px] font-black uppercase text-black tracking-widest">Candidate Signature</p>
            </div>

            {/* Important Instructions */}
            <div className="mt-4 border border-slate-200 rounded-2xl p-6 bg-white shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -rotate-45 translate-x-16 -translate-y-16 opacity-50" />
                <h5 className="text-[10px] font-black uppercase text-black mb-4 underline decoration-2 underline-offset-4 tracking-[0.2em]">Important Instructions for Candidates:</h5>
                <ol className="text-[9px] text-slate-900 space-y-2.5 list-decimal pl-5 font-bold uppercase leading-normal">
                    <li>Reach the examination centre at least half an hour before the commencement of the examination and occupy the seat that bears your roll number.</li>
                    <li>Must come with admit card, photo identity proof like aadhaar card along with school identity card.</li>
                    <li>Do not carry mobile phones, calculator, mathematical & physical table or any other kind of reckoner to the examination hall.</li>
                    <li>Use black or blue ball point pen to colour the bubble of OMR sheet.</li>
                    <li>During the examination follow the instructions of the invigilator and instructions of the question paper strictly.</li>
                    <li>Students are not allowed to leave the examination hall within the time period of exam.</li>
                    <li>Without admit card along with valid photo ID card no entry will be permitted in any case.</li>
                    <li>Violation of any instructions may lead to disqualification from the summer camp selection.</li>
                </ol>
            </div>
            
            {/* Decorative Side Element */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 opacity-20" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="group">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] block mb-0.5 transition-colors group-hover:text-blue-500">{label}</label>
            <p className="text-sm font-black text-black border-b border-slate-100 pb-1.5 truncate uppercase">
                {value || '___'}
            </p>
        </div>
    );
}
