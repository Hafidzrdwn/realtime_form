import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const BASE_URL = import.meta.env.VITE_BASE_URL || window.location.origin;

export const copyFormLink = async (path = '/') => {
  const url = `${BASE_URL}${path}`;
  try {
    await navigator.clipboard.writeText(url);
    return { success: true, url };
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = url;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return { success: true, url };
  }
};

export const exportToExcel = (headers, rows, filename = 'export') => {
  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = headers.map((h, i) => {
    const maxLen = Math.max(h.length, ...rows.map(r => String(r[i] ?? '').length));
    return { wch: Math.min(maxLen + 4, 50) };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToPDF = (title, headers, rows, filename = 'export') => {
  const doc = new jsPDF({ orientation: headers.length > 5 ? 'landscape' : 'portrait' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text(`Diekspor pada: ${new Date().toLocaleString('id-ID')}  •  Total: ${rows.length} data`, 14, 28);
  doc.setTextColor(0);

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 34,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    styles: {
      overflow: 'linebreak',
      lineWidth: 0.3,
      lineColor: [220, 220, 220],
    },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${filename}.pdf`);
};
