import fs from 'fs/promises';
import path from 'path';
import { type Product, type InsertProduct, type Receipt, type InsertReceipt } from "@shared/schema";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  saveProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: InsertProduct): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  getReceipts(): Promise<Receipt[]>;
  saveReceipt(receipt: InsertReceipt): Promise<Receipt>;
  deleteReceipt(id: number): Promise<void>;
}

export class JSONStorage implements IStorage {
  private productsPath: string;
  private receiptsPath: string;
  private productId: number = 1;
  private receiptId: number = 1;

  constructor() {
    this.productsPath = path.join(process.cwd(), 'attached_assets', 'products.json');
    this.receiptsPath = path.join(process.cwd(), 'attached_assets', 'receipts.json');
    this.initializeStorage();
  }

  private async initializeStorage() {
    try {
      // No need to create directory since files are in attached_assets
      await this.ensureFile(this.receiptsPath);
    } catch (error) {
      console.error('Failed to initialize storage:', error);
    }
  }

  private async ensureFile(filePath: string) {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, '[]');
    }
  }

  async getProducts(): Promise<Product[]> {
    const data = await fs.readFile(this.productsPath, 'utf-8');
    const products = JSON.parse(data);
    return products.map((p: any, index: number) => ({
      ...p,
      id: index + 1,
      price: Number(p.price)
    }));
  }

  async saveProduct(product: InsertProduct): Promise<Product> {
    const products = await this.getProducts();
    const newProduct = { ...product, id: this.productId++ } as Product;
    products.push(newProduct);
    await fs.writeFile(this.productsPath, JSON.stringify(products));
    return newProduct;
  }

  async updateProduct(id: number, product: InsertProduct): Promise<Product> {
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');

    const updatedProduct = { ...product, id } as Product;
    products[index] = updatedProduct;
    await fs.writeFile(this.productsPath, JSON.stringify(products));
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    const products = await this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    await fs.writeFile(this.productsPath, JSON.stringify(filtered));
  }

  async reorderProduct(id: number, direction: 'up' | 'down'): Promise<void> {
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= products.length) return;
    
    [products[index], products[newIndex]] = [products[newIndex], products[index]];
    await fs.writeFile(this.productsPath, JSON.stringify(products));
  }

  async getReceipts(): Promise<Receipt[]> {
    const data = await fs.readFile(this.receiptsPath, 'utf-8');
    return JSON.parse(data);
  }

  async saveReceipt(receipt: InsertReceipt): Promise<Receipt> {
    const receipts = await this.getReceipts();
    const newReceipt = { ...receipt, id: this.receiptId++ } as Receipt;
    receipts.push(newReceipt);
    await fs.writeFile(this.receiptsPath, JSON.stringify(receipts));
    return newReceipt;
  }

  async deleteReceipt(id: number): Promise<void> {
    const receipts = await this.getReceipts();
    const filtered = receipts.filter(r => r.id !== id);
    await fs.writeFile(this.receiptsPath, JSON.stringify(filtered));
  }
}

export const storage = new JSONStorage();