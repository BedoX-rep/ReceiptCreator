import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReceiptSchema, type Product, type ReceiptItem, type InsertReceipt } from "@shared/schema";
import { generatePDF } from "@/lib/pdf";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Plus, Trash2 } from "lucide-react";

export default function NewReceipt() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [items, setItems] = useState<ReceiptItem[]>([]);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const form = useForm<InsertReceipt>({
    resolver: zodResolver(insertReceiptSchema),
    defaultValues: {
      clientName: "",
      clientPhone: "",
      rightEye: { sph: "", cyl: "", axe: "" },
      leftEye: { sph: "", cyl: "", axe: "" },
      items: [],
      subtotal: 0,
      discount: 0,
      numericalDiscount: 0,
      advancePayment: 0,
      total: 0,
      balanceDue: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertReceipt) => {
      const response = await apiRequest("POST", "/api/receipts", data);
      return response.json();
    },
    onSuccess: (receipt) => {
      toast({ title: "Receipt created successfully" });
      const pdfDataUri = generatePDF(receipt);
      const link = document.createElement("a");
      link.href = pdfDataUri;
      link.download = `receipt-${receipt.id}.pdf`;
      link.click();
      setLocation("/receipts");
    },
  });

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  const addItem = () => {
    const product = products.find((p) => p.name === selectedProduct);
    if (!product) return;

    const newItem: ReceiptItem = {
      product: product.name,
      quantity,
      price: Number(product.price),
      total: Number(product.price) * quantity,
    };

    setItems([...items, newItem]);
    setSelectedProduct("");
    setQuantity(1);
    calculateTotals(); // Recalculate totals after adding an item
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    calculateTotals(); // Recalculate totals after removing an item
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discount = Number(form.getValues("discount")) || 0;
    const numericalDiscount = Number(form.getValues("numericalDiscount")) || 0;
    const advancePayment = Number(form.getValues("advancePayment")) || 0;

    // Calculate total after percentage discount
    const afterDiscount = subtotal * (1 - discount / 100);
    // Apply additional numerical discount
    const total = Math.max(0, afterDiscount - numericalDiscount);
    const balanceDue = Math.max(0, total - advancePayment);

    form.setValue("subtotal", subtotal);
    form.setValue("total", total);
    form.setValue("balanceDue", balanceDue);
    form.setValue("items", items);
  };

  const onSubmit = async (data: InsertReceipt) => {
    calculateTotals();
    await createMutation.mutateAsync(data);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Generate Receipt</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prescription</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-medium">Right Eye</h3>
                <div className="grid gap-4 grid-cols-3">
                  <FormField
                    control={form.control}
                    name="rightEye.sph"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SPH</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rightEye.cyl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CYL</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rightEye.axe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AXE</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Left Eye</h3>
                <div className="grid gap-4 grid-cols-3">
                  <FormField
                    control={form.control}
                    name="leftEye.sph"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SPH</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="leftEye.cyl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CYL</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="leftEye.axe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AXE</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Select
                  value={selectedProduct}
                  onValueChange={setSelectedProduct}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.name}>
                        {product.name} - ${Number(product.price).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-24"
                />

                <Button type="button" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.product}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell>${item.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          {...field}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                            calculateTotals();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numericalDiscount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Discount ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                            calculateTotals();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="advancePayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Advance Payment</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                            calculateTotals();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <p className="text-lg">
                    Subtotal: ${form.watch("subtotal") ? Number(form.watch("subtotal")).toFixed(2) : "0.00"}
                  </p>
                  {form.watch("discount") && (
                    <p className="text-lg text-muted-foreground">
                      After {form.watch("discount")}% Discount: $
                      {(Number(form.watch("subtotal")) * (1 - Number(form.watch("discount")) / 100)).toFixed(2)}
                    </p>
                  )}
                  {form.watch("numericalDiscount") && (
                    <p className="text-lg text-muted-foreground">
                      Additional Discount: ${Number(form.watch("numericalDiscount")).toFixed(2)}
                    </p>
                  )}
                  <p className="text-xl font-bold">
                    Total: ${form.watch("total") ? Number(form.watch("total")).toFixed(2) : "0.00"}
                  </p>
                  {form.watch("advancePayment") && (
                    <p className="text-lg text-muted-foreground">
                      Advance Payment: ${Number(form.watch("advancePayment")).toFixed(2)}
                    </p>
                  )}
                  <p className="text-lg font-semibold">
                    Balance Due: ${form.watch("balanceDue") ? Number(form.watch("balanceDue")).toFixed(2) : "0.00"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              Generate Receipt
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}