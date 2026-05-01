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
      <DialogContent className="max-w-[850px] bg-white p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-4 bg-white border-b flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-lg font-bold text-slate-800">Preview Admit Card</DialogTitle>
          </div>
          <Button onClick={handleDownload} variant="default" className="bg-red-600 hover:bg-red-700 h-9 font-bold">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </DialogHeader>

        <div className="bg-white overflow-y-auto max-h-[85vh]">
          {/* THE CARD - Refined Document Style */}
          <div 
            ref={cardRef}
            className="w-full bg-white p-12 relative text-slate-900"
            style={{ fontFamily: 'Inter, "Segoe UI", Roboto, sans-serif' }}
          >
            {/* 1. Header Section */}
            <div className="flex justify-between items-center mb-6">
              {/* Logo Area */}
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="GOAL Logo" className="h-16 w-auto object-contain" />              </div>

              {/* Title */}
              <div className="text-center">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Summer Camp - 2026</h1>
              </div>

              {/* Admit Card Label */}
              <div className="bg-[#2D4296] text-white px-8 py-2.5 rounded-lg font-black text-lg tracking-widest shadow-md">
                ADMIT CARD
              </div>
            </div>

            <div className="h-[2px] bg-[#2D4296] w-full opacity-10 mb-8" />

            {/* 2. Main Content Grid */}
            <div className="grid grid-cols-12 gap-8">
              {/* Left Side: Student Details */}
              <div className="col-span-9 space-y-6">
                {/* Roll Number Section */}
                <div className="mb-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-1">Roll Number</label>
                  <h2 className="text-5xl font-black text-black tracking-tight leading-none">{registration.rollNumber}</h2>
                  <div className="h-px bg-slate-100 w-full mt-4" />
                </div>

                <div className="space-y-4">
                  <DetailRow label="Candidate Name" value={registration.studentName} />
                  <DetailRow label="Father's Name" value={registration.fatherName} />
                  
                  <div className="grid grid-cols-2 gap-12">
                    <DetailRow label="Gender" value={registration.gender} />
                    <DetailRow label="Present Class" value={registration.currentClass} />
                  </div>

                  <DetailRow label="Correspondence Address" value={registration.address} />

                  <div className="grid grid-cols-2 gap-12">
                    <DetailRow label="District" value={registration.district} />
                    <DetailRow label="State" value={registration.state} />
                  </div>

                  <DetailRow label="School Name" value={registration.schoolName} />
                  <DetailRow label="School Address" value={registration.schoolAddress || 'N/A'} />
                </div>
              </div>

              {/* Right Side: Photo & Signatory */}
              <div className="col-span-3 flex flex-col items-center">
                {/* Photo Box */}
                <div className="w-full aspect-[4/5] bg-white border-2 border-slate-100 rounded-xl flex items-center justify-center p-1 mb-8 shadow-sm overflow-hidden group">
                  {registration.photograph ? (
                    <img 
                      src={registration.photograph.startsWith('http') ? registration.photograph : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '')}${registration.photograph}`} 
                      alt="Student" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                      <User className="h-12 w-12 text-slate-200" />
                    </div>
                  )}
                </div>

                {/* Official Stamp Box */}
                <div className="w-32 h-16 border-2 border-slate-100 rounded-lg flex items-center justify-center bg-slate-50 mb-12 overflow-hidden">
                  <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter italic text-center px-2">Official Stamp Here</span>
                </div>

                {/* Authorized Signatory */}
                <div className="mt-auto w-full text-center">
                  <div className="border-t-2 border-slate-800 w-full mb-2" />
                  <p className="text-[10px] font-black uppercase text-slate-900 tracking-wider">Authorized Signatory</p>
                </div>
              </div>
            </div>

            {/* 3. Examination Details Box */}
            <div className="mt-12 bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <h4 className="text-[11px] font-black uppercase text-black mb-4 border-b border-slate-200 pb-2 tracking-[0.2em] flex items-center justify-between">
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
                  <p className="text-sm font-black text-red-600 mb-0.5">Goal Institute, Kankarbagh</p>
                  <p className="text-[10px] text-slate-500 font-bold leading-tight">Tilak Nagar Road, Opp. Rajendra Nagar Terminal, Near Sahaj Nursing Home, Munna Chowk</p>
                  <p className="text-[9px] text-slate-400 font-medium mt-1 uppercase italic">Center Code: {registration.examCenter}</p>
                </div>
              </div>
            </div>

            {/* 4. Candidate Signature Section */}
            <div className="mt-16 mb-8 flex flex-col items-start">
              <div className="w-56 border-b-2 border-slate-800 mb-2" />
              <p className="text-[11px] font-black uppercase text-slate-900 tracking-[0.15em]">Candidate Signature</p>
            </div>

            {/* 5. Important Instructions Box */}
            <div className="mt-4 border-2 border-slate-100 rounded-2xl p-6 bg-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#2D4296] opacity-10" />
              <h5 className="text-[11px] font-black uppercase text-black mb-4 underline decoration-2 underline-offset-4 tracking-[0.1em]">Important Instructions for Candidates:</h5>
              <ol className="text-[10px] text-slate-900 space-y-2 list-decimal pl-5 font-bold uppercase leading-tight">
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
            
            {/* Footer Watermark */}
            <div className="mt-10 pt-4 border-t border-slate-100 flex justify-between items-center opacity-30 italic">
              <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Generated via Goal Admin Dashboard</span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="group border-b border-slate-50 pb-1.5">
      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-0.5 transition-colors group-hover:text-blue-500">{label}</label>
      <p className="text-sm font-black text-black uppercase leading-tight">
        {value || '___'}
      </p>
    </div>
  );
}

