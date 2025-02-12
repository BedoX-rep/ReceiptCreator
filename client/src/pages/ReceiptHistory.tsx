import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Receipt } from "@shared/schema";
import { generatePDF } from "@/lib/pdf";
import { format } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Download,
  Trash2,
  Eye,
  History,
} from "lucide-react";

export default function ReceiptHistory() {
  const { toast } = useToast();
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: receipts = [], isLoading } = useQuery<Receipt[]>({
    queryKey: ["/api/receipts"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/receipts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/receipts"] });
      toast({ title: "Receipt deleted successfully" });
    },
  });

  const downloadPDF = (receipt: Receipt) => {
    const pdfDataUri = generatePDF(receipt);
    const link = document.createElement("a");
    link.href = pdfDataUri;
    link.download = `receipt-${receipt.id}.pdf`;
    link.click();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <History className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Receipt History</h1>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Client Name</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Balance Due</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receipts.map((receipt) => (
            <TableRow key={receipt.id}>
              <TableCell>
                {receipt.date ? format(new Date(receipt.date), "dd/MM/yyyy HH:mm") : "N/A"}
              </TableCell>
              <TableCell>{receipt.clientName}</TableCell>
              <TableCell>${Number(receipt.total).toFixed(2)}</TableCell>
              <TableCell>${Number(receipt.balanceDue).toFixed(2)}</TableCell>
              <TableCell className="text-right space-x-2">
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSelectedReceipt(receipt)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  {selectedReceipt && (
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Receipt Details</DialogTitle>
                      </DialogHeader>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="grid gap-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h3 className="font-medium mb-2">
                                  Client Information
                                </h3>
                                <p>Name: {selectedReceipt.clientName}</p>
                                {selectedReceipt.clientPhone && (
                                  <p>Phone: {selectedReceipt.clientPhone}</p>
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium mb-2">Date</h3>
                                <p>
                                  {selectedReceipt.date 
                                      ? format(new Date(selectedReceipt.date), "dd/MM/yyyy HH:mm")
                                      : "N/A"}
                                </p>
                              </div>
                            </div>

                            <div>
                              <h3 className="font-medium mb-2">Prescription</h3>
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium">
                                    Right Eye
                                  </h4>
                                  <p>SPH: {selectedReceipt.rightEye.sph}</p>
                                  <p>CYL: {selectedReceipt.rightEye.cyl}</p>
                                  <p>AXE: {selectedReceipt.rightEye.axe}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">Left Eye</h4>
                                  <p>SPH: {selectedReceipt.leftEye.sph}</p>
                                  <p>CYL: {selectedReceipt.leftEye.cyl}</p>
                                  <p>AXE: {selectedReceipt.leftEye.axe}</p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h3 className="font-medium mb-2">Items</h3>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Total</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {selectedReceipt.items.map((item, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{item.product}</TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell>
                                        ${item.price.toFixed(2)}
                                      </TableCell>
                                      <TableCell>
                                        ${item.total.toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h3 className="font-medium mb-2">
                                  Payment Details
                                </h3>
                                <p>Subtotal: ${selectedReceipt.subtotal}</p>
                                {selectedReceipt.discount > 0 && (
                                  <p>Discount: {selectedReceipt.discount}%</p>
                                )}
                                {selectedReceipt.numericalDiscount > 0 && (
                                  <p>
                                    Additional Discount: $
                                    {selectedReceipt.numericalDiscount}
                                  </p>
                                )}
                                <p>Total: ${selectedReceipt.total}</p>
                                {selectedReceipt.advancePayment > 0 && (
                                  <p>
                                    Advance Payment: $
                                    {selectedReceipt.advancePayment}
                                  </p>
                                )}
                                <p>Balance Due: ${selectedReceipt.balanceDue}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogContent>
                  )}
                </Dialog>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => downloadPDF(receipt)}
                >
                  <Download className="h-4 w-4" />
                </Button>

                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteMutation.mutate(receipt.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}