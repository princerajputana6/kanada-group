"use client";

import { Button } from "@kanada/ui";
import { formatDate } from "@/lib/utils";
import { Emblem } from "./logo";

export interface CertificateProps {
  studentName: string;
  courseTitle: string;
  teacherName: string;
  completedAt: Date | string;
  certificateId: string;
}

export function Certificate({
  studentName,
  courseTitle,
  teacherName,
  completedAt,
  certificateId,
}: CertificateProps) {
  return (
    <div>
      <div className="mb-6 flex justify-center gap-3 print:hidden">
        <Button onClick={() => window.print()}>Download / Print Certificate</Button>
      </div>

      {/* Certificate is a deliberately light, printable document regardless of
          the app's dark theme — explicit colors, not theme tokens. CSS entrance
          (not framer) so it can never be stranded invisible on the dark page. */}
      <div className="certificate animate-fade-scale-in mx-auto aspect-[1.414/1] w-full max-w-4xl overflow-hidden rounded-2xl border-[10px] border-double border-indigo-500/70 bg-white p-10 text-slate-900 shadow-2xl sm:p-16">
        <div className="flex h-full flex-col items-center justify-between text-center">
          <div>
            <Emblem className="mx-auto mb-3 h-14 sm:h-16" />
            <p className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-sm font-semibold uppercase tracking-[0.3em] text-transparent">
              Kanada Group
            </p>
            <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">
              VLSI Learning Platform
            </p>
          </div>

          <div>
            <p className="text-lg uppercase tracking-[0.2em] text-slate-500">
              Certificate of Completion
            </p>
            <p className="mt-6 font-serif text-4xl font-bold text-slate-900 sm:text-5xl">
              {studentName}
            </p>
            <p className="mt-6 text-sm text-slate-500 sm:text-base">
              has successfully completed the course
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">{courseTitle}</p>
          </div>

          <div className="flex w-full items-end justify-between text-sm">
            <div className="text-left">
              <p className="border-t border-slate-300 pt-1 font-medium">{teacherName}</p>
              <p className="text-xs text-slate-500">Instructor</p>
            </div>
            <p className="text-xs text-slate-400">
              Certificate ID: {certificateId.slice(0, 8).toUpperCase()}
            </p>
            <div className="text-right">
              <p className="border-t border-slate-300 pt-1 font-medium">
                {formatDate(completedAt)}
              </p>
              <p className="text-xs text-slate-500">Date completed</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 0.5in;
          }
          body * {
            visibility: hidden;
          }
          .certificate,
          .certificate * {
            visibility: visible;
          }
          .certificate {
            position: fixed;
            inset: 0;
            width: 100% !important;
            max-width: none !important;
            aspect-ratio: auto !important;
            box-shadow: none !important;
            border-width: 6px !important;
          }
        }
      `}</style>
    </div>
  );
}
