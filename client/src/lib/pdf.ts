import { jsPDF } from 'jspdf';
import { Receipt } from '@shared/schema';
import { format } from 'date-fns';

export function generatePDF(receipt: Receipt): string {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(20);
  doc.text('Lens Optic', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Receipt #${receipt.id}`, 20, 40);
  doc.text(`Date: ${format(new Date(receipt.date), 'dd/MM/yyyy HH:mm')}`, 20, 50);
  
  // Client Info
  doc.text(`Client: ${receipt.clientName}`, 20, 70);
  if (receipt.clientPhone) {
    doc.text(`Phone: ${receipt.clientPhone}`, 20, 80);
  }
  
  // Prescription
  doc.text('Prescription:', 20, 100);
  doc.text('Right Eye:', 30, 110);
  doc.text(`SPH: ${receipt.rightEye.sph} CYL: ${receipt.rightEye.cyl} AXE: ${receipt.rightEye.axe}`, 40, 120);
  doc.text('Left Eye:', 30, 130);
  doc.text(`SPH: ${receipt.leftEye.sph} CYL: ${receipt.leftEye.cyl} AXE: ${receipt.leftEye.axe}`, 40, 140);
  
  // Items
  let y = 160;
  doc.text('Items:', 20, y);
  y += 10;
  
  receipt.items.forEach((item: any) => {
    doc.text(`${item.product} x${item.quantity} @ $${item.price.toFixed(2)} = $${item.total.toFixed(2)}`, 30, y);
    y += 10;
  });
  
  // Totals
  y += 10;
  doc.text(`Subtotal: $${receipt.subtotal.toFixed(2)}`, 20, y);
  y += 10;
  if (receipt.discount > 0) {
    doc.text(`Discount: ${receipt.discount}%`, 20, y);
    y += 10;
  }
  if (receipt.numericalDiscount > 0) {
    doc.text(`Additional Discount: $${receipt.numericalDiscount.toFixed(2)}`, 20, y);
    y += 10;
  }
  doc.text(`Total: $${receipt.total.toFixed(2)}`, 20, y);
  y += 10;
  if (receipt.advancePayment > 0) {
    doc.text(`Advance Payment: $${receipt.advancePayment.toFixed(2)}`, 20, y);
    y += 10;
  }
  doc.text(`Balance Due: $${receipt.balanceDue.toFixed(2)}`, 20, y);
  
  return doc.output('datauristring');
}
