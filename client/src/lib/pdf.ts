
import { jsPDF } from 'jspdf';
import { type Receipt, type ReceiptItem } from '@shared/schema';
import { format } from 'date-fns';

export function generatePDF(receipt: Receipt): string {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Header
  doc.setFontSize(24);
  doc.setTextColor(44, 62, 80);
  doc.text('LENS OPTIC', pageWidth / 2, y, { align: 'center' });
  
  y += 15;
  doc.setFontSize(10);
  doc.text('Professional Optical Services', pageWidth / 2, y, { align: 'center' });
  
  y += 20;
  // Receipt Info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Receipt #${receipt.id}`, margin, y);
  doc.text(`Date: ${receipt.date ? format(new Date(receipt.date), 'dd/MM/yyyy HH:mm') : format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth - margin, y, { align: 'right' });

  // Client Info
  y += 20;
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - (2 * margin), 25, 'F');
  y += 6;
  doc.setFontSize(10);
  doc.text('BILLED TO:', margin + 5, y);
  y += 8;
  doc.setFontSize(12);
  doc.text(receipt.clientName, margin + 5, y);
  if (receipt.clientPhone) {
    doc.setFontSize(10);
    doc.text(`Phone: ${receipt.clientPhone}`, margin + 5, y + 8);
  }

  // Prescription
  y += 25;
  doc.setFontSize(12);
  doc.setTextColor(44, 62, 80);
  doc.text('PRESCRIPTION DETAILS', margin, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const rightEye = receipt.rightEye as { sph: string; cyl: string; axe: string };
  const leftEye = receipt.leftEye as { sph: string; cyl: string; axe: string };
  
  // Prescription table
  const prescriptionHeaders = ['', 'SPH', 'CYL', 'AXE'];
  const prescriptionData = [
    ['Right Eye', rightEye.sph, rightEye.cyl, rightEye.axe],
    ['Left Eye', leftEye.sph, leftEye.cyl, leftEye.axe]
  ];
  
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - (2 * margin), 8, 'F');
  
  const colWidth = (pageWidth - (2 * margin)) / 4;
  prescriptionHeaders.forEach((header, i) => {
    doc.text(header, margin + (colWidth * i), y + 6);
  });
  
  y += 10;
  prescriptionData.forEach((row) => {
    row.forEach((cell, i) => {
      doc.text(cell, margin + (colWidth * i), y + 6);
    });
    y += 8;
  });

  // Items
  y += 15;
  doc.setFontSize(12);
  doc.setTextColor(44, 62, 80);
  doc.text('ITEMS', margin, y);
  
  y += 10;
  // Item table headers
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - (2 * margin), 8, 'F');
  
  const itemHeaders = ['Product', 'Quantity', 'Price', 'Total'];
  const itemColWidths = [pageWidth - (3 * margin) - 90, 30, 30, 30];
  let xPos = margin;
  
  doc.setFontSize(10);
  itemHeaders.forEach((header, i) => {
    doc.text(header, xPos, y + 6);
    xPos += itemColWidths[i];
  });

  // Item rows
  y += 10;
  doc.setTextColor(0, 0, 0);
  const items = receipt.items as ReceiptItem[];
  items.forEach((item) => {
    xPos = margin;
    doc.text(item.product, xPos, y + 6);
    xPos += itemColWidths[0];
    doc.text(item.quantity.toString(), xPos, y + 6);
    xPos += itemColWidths[1];
    doc.text(`$${item.price.toFixed(2)}`, xPos, y + 6);
    xPos += itemColWidths[2];
    doc.text(`$${item.total.toFixed(2)}`, xPos, y + 6);
    y += 8;
  });

  // Totals
  y += 10;
  const totalsX = pageWidth - margin - 80;
  doc.text('Subtotal:', totalsX, y);
  doc.text(`$${Number(receipt.subtotal).toFixed(2)}`, pageWidth - margin, y, { align: 'right' });

  if (Number(receipt.discount) > 0) {
    y += 8;
    doc.text(`Discount (${receipt.discount}%):`, totalsX, y);
    const discountAmount = Number(receipt.subtotal) * (Number(receipt.discount) / 100);
    doc.text(`-$${discountAmount.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
  }

  if (Number(receipt.numericalDiscount) > 0) {
    y += 8;
    doc.text('Additional Discount:', totalsX, y);
    doc.text(`-$${Number(receipt.numericalDiscount).toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
  }

  y += 10;
  doc.setFontSize(12);
  doc.setTextColor(44, 62, 80);
  doc.text('Total:', totalsX, y);
  doc.text(`$${Number(receipt.total).toFixed(2)}`, pageWidth - margin, y, { align: 'right' });

  if (Number(receipt.advancePayment) > 0) {
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Advance Payment:', totalsX, y);
    doc.text(`$${Number(receipt.advancePayment).toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
    
    y += 8;
    doc.text('Balance Due:', totalsX, y);
    doc.text(`$${Number(receipt.balanceDue).toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
  }

  // Footer
  y = doc.internal.pageSize.getHeight() - 30;
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.text('Thank you for your business!', pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.text('For any inquiries, please contact us with your receipt number.', pageWidth / 2, y, { align: 'center' });

  return doc.output('datauristring');
}
