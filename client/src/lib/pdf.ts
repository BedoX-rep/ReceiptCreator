import { jsPDF } from 'jspdf';
import { type Receipt, type ReceiptItem } from '@shared/schema';
import { format } from 'date-fns';

export function generatePDF(receipt: Receipt): string {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.text('Lens Optic', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`Receipt #${receipt.id}`, 20, 40);
  doc.text(`Date: ${format(receipt.date ? new Date(receipt.date) : new Date(), 'dd/MM/yyyy HH:mm')}`, 20, 50);

  // Client Info
  doc.text(`Client: ${receipt.clientName}`, 20, 70);
  if (receipt.clientPhone) {
    doc.text(`Phone: ${receipt.clientPhone}`, 20, 80);
  }

  // Prescription
  const rightEye = receipt.rightEye as { sph: string; cyl: string; axe: string };
  const leftEye = receipt.leftEye as { sph: string; cyl: string; axe: string };

  doc.text('Prescription:', 20, 100);
  doc.text('Right Eye:', 30, 110);
  doc.text(`SPH: ${rightEye.sph} CYL: ${rightEye.cyl} AXE: ${rightEye.axe}`, 40, 120);
  doc.text('Left Eye:', 30, 130);
  doc.text(`SPH: ${leftEye.sph} CYL: ${leftEye.cyl} AXE: ${leftEye.axe}`, 40, 140);

  // Items
  let y = 160;
  doc.text('Items:', 20, y);
  y += 10;

  const items = receipt.items as ReceiptItem[];
  items.forEach((item) => {
    doc.text(`${item.product} x${item.quantity} @ $${item.price.toFixed(2)} = $${item.total.toFixed(2)}`, 30, y);
    y += 10;
  });

  // Totals
  y += 10;
  doc.text(`Subtotal: $${Number(receipt.subtotal).toFixed(2)}`, 20, y);
  y += 10;

  const discount = Number(receipt.discount);
  const numericalDiscount = Number(receipt.numericalDiscount);
  const advancePayment = Number(receipt.advancePayment);

  if (discount > 0) {
    doc.text(`Discount: ${discount}%`, 20, y);
    y += 10;
  }
  if (numericalDiscount > 0) {
    doc.text(`Additional Discount: $${numericalDiscount.toFixed(2)}`, 20, y);
    y += 10;
  }
  doc.text(`Total: $${Number(receipt.total).toFixed(2)}`, 20, y);
  y += 10;
  if (advancePayment > 0) {
    doc.text(`Advance Payment: $${advancePayment.toFixed(2)}`, 20, y);
    y += 10;
  }
  doc.text(`Balance Due: $${Number(receipt.balanceDue).toFixed(2)}`, 20, y);

  return doc.output('datauristring');
}