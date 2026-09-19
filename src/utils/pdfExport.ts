import { jsPDF } from 'jspdf';
import { DailyObservation } from '../types';

export interface PDFExportOptions {
  startDate?: string;
  endDate?: string;
  title?: string;
  selectedZone?: string;
}

export const exportWeeklyEvaluationPDF = (
  observations: DailyObservation[],
  options: PDFExportOptions = {}
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth ? doc.internal.pageSize.getWidth() : doc.internal.pageSize.width;
  const margin = 14;
  let currentY = 16;

  // Header Banner
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('DAILY CHECK ALSUTERS', margin, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('LAPORAN EVALUASI DISPLAY & OBSERVASI HARIAN 3 DIVISI (VM, MANAGER, PS)', margin, 18);

  const printTime = new Date().toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Waktu Cetak: ${printTime}`, pageWidth - margin - 45, 18);

  currentY = 36;

  // Evaluation Metrics Summary Box
  const totalObs = observations.length;
  const standardCount = observations.filter(o => o.status === 'STANDARD').length;
  const nonStandardCount = observations.filter(o => o.status === 'NON_STANDARD').length;
  const resolvedCount = observations.filter(o => o.status === 'RESOLVED').length;
  const complianceRate = totalObs > 0 ? Math.round(((standardCount + resolvedCount) / totalObs) * 100) : 100;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 22, 2, 2, 'FD');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN PERFORMA EVALUASI:', margin + 4, currentY + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Total Pengecekan: ${totalObs} Dept`, margin + 4, currentY + 12);
  doc.text(`• Display Standar: ${standardCount}`, margin + 50, currentY + 12);
  doc.text(`• Temuan Non-Standar: ${nonStandardCount}`, margin + 95, currentY + 12);
  doc.text(`• Selesai Dieksekusi PS: ${resolvedCount}`, margin + 140, currentY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(complianceRate >= 85 ? 16 : 220, complianceRate >= 85 ? 130 : 38, 38);
  doc.text(`• Kepatuhan Total: ${complianceRate}%`, margin + 4, currentY + 18);

  currentY += 28;

  // List of Inspections
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DAFTAR DETAIL TEMUAN & OBSERVASI HARIAN', margin, currentY);
  currentY += 5;

  observations.forEach((obs, index) => {
    // Check page break
    if (currentY > 260) {
      doc.addPage();
      currentY = 16;
    }

    const isNonStd = obs.status === 'NON_STANDARD';
    const isResolved = obs.status === 'RESOLVED';

    // Item card background
    doc.setFillColor(isNonStd ? 254 : isResolved ? 240 : 248, isNonStd ? 242 : isResolved ? 253 : 250, isNonStd ? 242 : isResolved ? 244 : 252);
    doc.setDrawColor(isNonStd ? 252 : isResolved ? 134 : 203, isNonStd ? 165 : isResolved ? 239 : 213, isNonStd ? 165 : isResolved ? 172 : 225);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 28, 2, 2, 'FD');

    // Header within card
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${index + 1}. [${obs.deptCode}] ${obs.deptName} - ${obs.zoneId} ZONE`, margin + 3, currentY + 5);

    // Status Badge text
    const statusText = isNonStd ? 'TEMUAN NON-STANDAR' : isResolved ? 'SELESAI DIPERBAIKI (RESOLVED)' : 'STANDAR VM SESUAI';
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isNonStd ? 185 : isResolved ? 21 : 22, isNonStd ? 28 : isResolved ? 128 : 101, isNonStd ? 28 : isResolved ? 61 : 52);
    doc.text(statusText, pageWidth - margin - 55, currentY + 5);

    // Details text
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Tanggal: ${obs.date} | Pukul: ${obs.inspectionTime || '-'} WIB | Manager: ${obs.managerName}`, margin + 3, currentY + 10);

    // Checklist Summary
    const passedChecks = obs.checklist.filter(c => c.passed).length;
    const totalChecks = obs.checklist.length;
    doc.text(`Ceklis Lolos: ${passedChecks}/${totalChecks} kriteria standar VM`, margin + 3, currentY + 15);

    // Manager Notes / Description
    const managerNote = obs.managerNotes ? `Catatan Manager: "${obs.managerNotes}"` : 'Catatan: Display memenuhi standar VM.';
    const splitNote = doc.splitTextToSize(managerNote, pageWidth - margin * 2 - 8);
    doc.setTextColor(51, 65, 85);
    doc.text(splitNote.slice(0, 2), margin + 3, currentY + 20);

    // PS Action taken
    if (obs.assignedPsName || obs.resolvedByPsName) {
      doc.setFontSize(7.5);
      doc.setTextColor(14, 116, 144);
      const psText = isResolved
        ? `Eksekusi PS: ${obs.resolvedByPsName || obs.assignedPsName} | Waktu: ${obs.executionTime || '-'} WIB | Ket: ${obs.psNotes || 'Sudah disesuaikan'}`
        : `PIC PS Ditugaskan: ${obs.assignedPsName || 'Team PS Dept'} (Menunggu Perbaikan)`;
      const splitPs = doc.splitTextToSize(psText, pageWidth - margin * 2 - 8);
      doc.text(splitPs.slice(0, 1), margin + 3, currentY + 25);
    }

    currentY += 32;
  });

  // Footer on each page
  const pageCount = (doc as any).getNumberOfPages ? (doc as any).getNumberOfPages() : 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Halaman ${i} dari ${pageCount} - Dokumen Resmi Evaluasi Toko DAILY CHECK ALSUTERS`, margin, 290);
  }

  const filename = `Laporan_Evaluasi_DailyCheck_Alsuters_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};
