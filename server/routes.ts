import { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertReceiptSchema } from "@shared/schema";

export function registerRoutes(app: Express) {
  // Products API
  app.get('/api/products', async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post('/api/products', async (req, res) => {
    const result = insertProductSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    const product = await storage.saveProduct(result.data);
    res.status(201).json(product);
  });

  app.put('/api/products/:id', async (req, res) => {
    const result = insertProductSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    try {
      const product = await storage.updateProduct(Number(req.params.id), result.data);
      res.json(product);
    } catch (error) {
      res.status(404).json({ error: 'Product not found' });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteProduct(id);
    res.status(204).send();
  });

  app.post("/api/products/:id/reorder", async (req, res) => {
    const id = Number(req.params.id);
    const { direction } = req.body;
    await storage.reorderProduct(id, direction);
    res.status(200).send();
  });

  // Receipts API
  app.get('/api/receipts', async (req, res) => {
    const receipts = await storage.getReceipts();
    res.json(receipts);
  });

  app.post('/api/receipts', async (req, res) => {
    const result = insertReceiptSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    const receipt = await storage.saveReceipt(result.data);
    res.status(201).json(receipt);
  });

  app.delete('/api/receipts/:id', async (req, res) => {
    await storage.deleteReceipt(Number(req.params.id));
    res.status(204).send();
  });

  return createServer(app);
}