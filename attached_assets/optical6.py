import json
import os
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from datetime import datetime
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
import customtkinter as ctk
# Add after the imports
# Add after the imports
ctk.set_appearance_mode("System")
ctk.set_default_color_theme("blue")
# Define custom colors and styles

class DataManager:
    def __init__(self):
        self.data_dir = "data"
        self.products_file = os.path.join(self.data_dir, "products.json")
        self.receipts_file = os.path.join(self.data_dir, "receipts.json")
        self._initialize_data_files()

    def _initialize_data_files(self):
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
        for file in [self.products_file, self.receipts_file]:
            if not os.path.exists(file):
                with open(file, 'w') as f:
                    json.dump([], f)

    def get_products(self):
        with open(self.products_file, 'r') as f:
            return json.load(f)

    def save_product(self, products):
        with open(self.products_file, 'w') as f:
            json.dump(products, f)
    
    def get_receipts(self):
        with open(self.receipts_file, 'r') as f:
            return json.load(f)

    def save_receipt(self, receipt):
        receipts = self.get_receipts()
        receipts.append(receipt)
        with open(self.receipts_file, 'w') as f:
            json.dump(receipts, f)
    def delete_receipt(self, index):
        receipts = self.get_receipts()
        receipts.pop(index)
        with open(self.receipts_file, 'w') as f:
            json.dump(receipts, f)

    def update_receipt(self, index, receipt):
        receipts = self.get_receipts()
        receipts[index] = receipt
        with open(self.receipts_file, 'w') as f:
            json.dump(receipts, f)
class MainApplication(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.COLORS = {
    'primary': '#1f538d',
    'secondary': '#14375e',
    'accent': '#2c7be5',
    'background': '#f8f9fa',
    'text': '#212529' }

        self.STYLES = {
            'heading': ctk.CTkFont(family="Helvetica", size=24, weight="bold"),
            'subheading': ctk.CTkFont(family="Helvetica", size=18, weight="bold"),
            'normal': ctk.CTkFont(family="Helvetica", size=14),
            'small': ctk.CTkFont(family="Helvetica", size=12) }
        self.title("Lens Optic")
        self.geometry("1400x600")
        
        # Configure grid weights
        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(1, weight=1)
        
        # Create sidebar
        self.sidebar = ctk.CTkFrame(self, width=250, corner_radius=0)
        self.sidebar.grid(row=0, column=0, sticky="nsew")
        
        # Logo/Title area
        logo_label = ctk.CTkLabel(self.sidebar, text="Lens Optic", 
                                font=self.STYLES['heading'],
                                text_color=self.COLORS['accent'])
        logo_label.grid(row=0, column=0, padx=20, pady=(20,40))
        
        # Navigation buttons
        nav_buttons = [
            ("🏠 Home", "HomeFrame"),
            ("📦 Product Management", "ProductManager"),
            ("📝 Generate Receipt", "ReceiptGenerator"),
            ("📋 Receipt History", "ReceiptHistory")
        ]
        
        for idx, (text, frame_name) in enumerate(nav_buttons):
            btn = ctk.CTkButton(
                self.sidebar, text=text,
                font=self.STYLES['normal'],
                height=50,
                fg_color="transparent",
                text_color=self.COLORS['text'],
                hover_color=self.COLORS['accent'],
                anchor="w",
                command=lambda name=frame_name: self.show_frame(name)
            )
            btn.grid(row=idx+1, column=0, padx=20, pady=10, sticky="ew")
        
        # Main content area
        self.content = ctk.CTkFrame(self)
        self.content.grid(row=0, column=1, sticky="nsew", padx=20, pady=20)
        self.content.grid_rowconfigure(0, weight=1)
        self.content.grid_columnconfigure(0, weight=1)
        
        # Initialize frames
        self.frames = {}
        for F in (HomeFrame, ProductManager, ReceiptGenerator, ReceiptHistory):
            frame = F(self.content, self)
            self.frames[F.__name__] = frame
            frame.grid(row=0, column=0, sticky="nsew")
        
        self.show_frame("HomeFrame")

    def show_frame(self, page_name):
        frame = self.frames[page_name]
        frame.tkraise()
        if hasattr(frame, "on_show"):
            frame.on_show()

class HomeFrame(ctk.CTkFrame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller
        # Configure grid
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)
        
        # Welcome section
        welcome_frame = ctk.CTkFrame(self)
        welcome_frame.grid(row=0, column=0, sticky="ew", padx=20, pady=20)
        
        ctk.CTkLabel(
            welcome_frame, 
            text="Welcome to Lens Optic",
            font=self.controller.STYLES['heading']
        ).pack(pady=20)
        
        # Dashboard cards
        dashboard = ctk.CTkFrame(self)
        dashboard.grid(row=1, column=0, sticky="nsew", padx=20)
        dashboard.grid_columnconfigure((0,1,2), weight=1)
        
        self.create_dashboard_card(
            dashboard, 0, "Products",
            "Manage your product inventory",
            "📦", "ProductManager"
        )
        self.create_dashboard_card(
            dashboard, 1, "New Receipt",
            "Generate a new receipt",
            "📝", "ReceiptGenerator"
        )
        self.create_dashboard_card(
            dashboard, 2, "History",
            "View receipt history",
            "📋", "ReceiptHistory"
        )

    def create_dashboard_card(self, parent, col, title, description, icon, target):
        card = ctk.CTkFrame(parent)
        card.grid(row=0, column=col, padx=10, pady=10, sticky="nsew")
        
        ctk.CTkLabel(
            card, text=icon,
            font=ctk.CTkFont(size=48)
        ).pack(pady=(20,10))
        
        ctk.CTkLabel(
            card, text=title,
            font=self.controller.STYLES['subheading']
        ).pack(pady=5)
        
        ctk.CTkLabel(
            card, text=description,
            font=self.controller.STYLES['normal']
        ).pack(pady=5)
        
        ctk.CTkButton(
            card, text="Open",
            command=lambda: self.controller.show_frame(target)
        ).pack(pady=20)

class ProductManager(ctk.CTkFrame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller
        self.data_manager = DataManager()
        self.products = self.data_manager.get_products()
        # Add to each class's __init__ method:
        # Style the Treeview
        style = ttk.Style()
        style.configure(
            "Treeview",
            background=self.controller.COLORS['background'],
            foreground=self.controller.COLORS['text'],
            rowheight=25,
            fieldbackground=self.controller.COLORS['background']
        )
        style.configure(
            "Treeview.Heading",
            background=self.controller.COLORS['primary'],
            foreground="white",
            relief="flat"
        )
        style.map("Treeview.Heading",
                 background=[('active', self.controller.COLORS['secondary'])])
        # Create widgets
        self.tree = ttk.Treeview(self, columns=('Name', 'Price'), show='headings')
        self.tree.heading('Name', text='Product Name')
        self.tree.heading('Price', text='Price')
        
        btn_frame = ctk.CTkFrame(self)
        ctk.CTkButton(btn_frame, text="Add", command=self.add_product).grid(row=0, column=0, padx=2)
        ctk.CTkButton(btn_frame, text="Edit", command=self.edit_product).grid(row=0, column=1, padx=2)
        ctk.CTkButton(btn_frame, text="Delete", command=self.delete_product).grid(row=0, column=2, padx=2)
        ctk.CTkButton(btn_frame, text="▲", width=30, command=self.move_up).grid(row=0, column=3, padx=2)
        ctk.CTkButton(btn_frame, text="▼", width=30, command=self.move_down).grid(row=0, column=4, padx=2)
        
        # Layout
        self.tree.pack(fill="both", expand=True, padx=20, pady=10)
        btn_frame.pack(pady=10)
        
        self.load_products()
    def move_up(self):
        selected = self.tree.selection()
        if not selected:
            return
        index = self.tree.index(selected[0])
        if index > 0:
            # Swap in data list
            self.products[index], self.products[index-1] = self.products[index-1], self.products[index]
            # Update treeview
            self.data_manager.save_product(self.products)
            self.load_products()
            self.tree.selection_set(self.tree.get_children()[index-1])
    def move_down(self):
        selected = self.tree.selection()
        if not selected:
            return
        index = self.tree.index(selected[0])
        if index < len(self.products) - 1:
            # Swap in data list
            self.products[index], self.products[index+1] = self.products[index+1], self.products[index]
            # Update treeview
            self.data_manager.save_product(self.products)
            self.load_products()
            self.tree.selection_set(self.tree.get_children()[index+1])
    def on_show(self):
        self.products = self.data_manager.get_products()
        self.load_products()

    def load_products(self):
        for item in self.tree.get_children():
            self.tree.delete(item)
        for product in self.products:
            self.tree.insert('', tk.END, values=(product['name'], f"${product['price']:.2f}"))

    def add_product(self):
        self._product_dialog("Add Product")

    def edit_product(self):
        selected = self.tree.selection()
        if not selected:
            return
        values = self.tree.item(selected[0], 'values')
        self._product_dialog("Edit Product", values[0], float(values[1][1:]))

    def _product_dialog(self, title, name="", price=0.0):
        dialog = ctk.CTkToplevel(self)
        dialog.title(title)
        
        ctk.CTkLabel(dialog, text="Product Name:").grid(row=0, column=0, padx=5, pady=5)
        name_entry = ctk.CTkEntry(dialog)
        name_entry.grid(row=0, column=1, padx=5, pady=5)
        name_entry.insert(0, name)
        
        ctk.CTkLabel(dialog, text="Price:").grid(row=1, column=0, padx=5, pady=5)
        price_entry = ctk.CTkEntry(dialog)
        price_entry.grid(row=1, column=1, padx=5, pady=5)
        price_entry.insert(0, str(price))
        
        def save():
            try:
                new_product = {
                    'name': name_entry.get(),
                    'price': float(price_entry.get())
                }
                if title == "Add Product":
                    self.products.append(new_product)
                else:
                    index = next(i for i, p in enumerate(self.products) if p['name'] == name)
                    self.products[index] = new_product
                self.data_manager.save_product(self.products)
                self.load_products()
                dialog.destroy()
            except ValueError:
                messagebox.showerror("Error", "Invalid price format")

        ctk.CTkButton(dialog, text="Save", command=save).grid(row=2, columnspan=2, pady=10)

    def delete_product(self):
        selected = self.tree.selection()
        if not selected:
            return
        name = self.tree.item(selected[0], 'values')[0]
        self.products = [p for p in self.products if p['name'] != name]
        self.data_manager.save_product(self.products)
        self.load_products()

class ReceiptGenerator(ctk.CTkFrame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller
        self.data_manager = DataManager()
        self.receipt_items = []
        
        # Create widgets
        main_frame = ctk.CTkFrame(self)
        main_frame.pack(fill="both", expand=True, padx=20, pady=20)
        
        # Client Information
        client_frame = ctk.CTkFrame(main_frame)
        client_frame.pack(fill="x", pady=5)
        
        ctk.CTkLabel(client_frame, text="Name:").grid(row=0, column=0, padx=5, pady=2)
        self.client_name = ctk.CTkEntry(client_frame)
        self.client_name.grid(row=0, column=1, padx=5, pady=2)
        
        ctk.CTkLabel(client_frame, text="Phone:").grid(row=0, column=2, padx=5, pady=2)
        self.client_phone = ctk.CTkEntry(client_frame)
        self.client_phone.grid(row=0, column=3, padx=5, pady=2)
        
        # Prescription Information
        prescription_frame = ctk.CTkFrame(main_frame)
        prescription_frame.pack(fill="x", pady=5)
        
        # Right Eye
        right_frame = ctk.CTkFrame(prescription_frame)
        right_frame.pack(side="left", padx=5)
        self.right_sph = self.create_prescription_field(right_frame, "SPH:")
        self.right_cyl = self.create_prescription_field(right_frame, "CYL:")
        self.right_axe = self.create_prescription_field(right_frame, "AXE:")
        
        # Left Eye
        left_frame = ctk.CTkFrame(prescription_frame)
        left_frame.pack(side="left", padx=5)
        self.left_sph = self.create_prescription_field(left_frame, "SPH:")
        self.left_cyl = self.create_prescription_field(left_frame, "CYL:")
        self.left_axe = self.create_prescription_field(left_frame, "AXE:")
        
        # Product Selection
        product_frame = ctk.CTkFrame(main_frame)
        product_frame.pack(fill="x", pady=5)
        
        self.product_var = ctk.StringVar()
        products = [p['name'] for p in self.data_manager.get_products()]
        self.product_cb = ctk.CTkComboBox(product_frame, variable=self.product_var, values=products)
        self.product_cb.pack(side="left", padx=5)
        
        self.qty_var = ctk.StringVar(value="1")
        ctk.CTkEntry(product_frame, textvariable=self.qty_var, width=50).pack(side="left", padx=5)
        ctk.CTkButton(product_frame, text="Add Item", command=self.add_item).pack(side="left", padx=5)
        ctk.CTkButton(product_frame, text="+", command=self.add_custom_product, width=30).pack(side="left", padx=5)
        ctk.CTkButton(product_frame, text="Tax", command=self.add_assurance_tax, width=50).pack(side="left", padx=5)
        # Items List
        self.tree = ttk.Treeview(main_frame, columns=('Product', 'Qty', 'Price', 'Total', 'Delete'), show='headings', height=8)  # Set fixed height
        self.tree.heading('Product', text='Product')
        self.tree.heading('Qty', text='Qty')
        self.tree.heading('Price', text='Price')
        self.tree.heading('Total', text='Total')
        self.tree.heading('Delete', text='')
        
        # Configure column widths
        self.tree.column('Product', width=200)
        self.tree.column('Qty', width=50)
        self.tree.column('Price', width=100)
        self.tree.column('Total', width=100)
        self.tree.column('Delete', width=50)
        
        self.tree.pack(fill="x", pady=5)  # Changed to fill="x" instead of "both"
        
        # Bind double-click event for editing and click event for delete button
        self.tree.bind('<Double-1>', self.edit_item)
        self.tree.bind('<Button-1>', self.handle_click)
        
        # Payment details frame - Modified for compact layout
        payment_frame = ctk.CTkFrame(main_frame)
        payment_frame.pack(fill="x", pady=(0, 5))
        
        # Left side - Discount and Advance Payment
        left_payment = ctk.CTkFrame(payment_frame)
        left_payment.pack(side="left", padx=5)
        
        # Numerical Discount row
        num_discount_frame = ctk.CTkFrame(left_payment)
        num_discount_frame.pack(fill="x", pady=2)
        ctk.CTkLabel(num_discount_frame, text="Discount ($):", width=80).pack(side="left", padx=2)
        self.num_discount_var = ctk.StringVar()
        self.num_discount_entry = ctk.CTkEntry(num_discount_frame, textvariable=self.num_discount_var, width=60)
        self.num_discount_entry.pack(side="left", padx=2)
        # Discount Row
        discount_frame = ctk.CTkFrame(left_payment)
        discount_frame.pack(fill="x", pady=2)
        ctk.CTkLabel(discount_frame, text="Discount (%):", width=80).pack(side="left", padx=2)
        self.discount_var = ctk.StringVar()
        self.discount_entry = ctk.CTkEntry(discount_frame, textvariable=self.discount_var, width=60)
        self.discount_entry.pack(side="left", padx=2)
        
        
        # Advance Payment row
        advance_frame = ctk.CTkFrame(left_payment)
        advance_frame.pack(fill="x", pady=2)
        ctk.CTkLabel(advance_frame, text="Advance:", width=80).pack(side="left", padx=2)
        self.advance_var = ctk.StringVar(value="0")
        self.advance_entry = ctk.CTkEntry(advance_frame, textvariable=self.advance_var, width=60)
        self.advance_entry.pack(side="left", padx=2)
        
        # Right side - Totals and Buttons
        right_payment = ctk.CTkFrame(payment_frame)
        right_payment.pack(side="right", padx=5)
        
        # Total and Balance
        self.total_var = ctk.StringVar(value="Total: $0.00")
        self.balance_var = ctk.StringVar(value="Balance Due: $0.00")
        ctk.CTkLabel(right_payment, textvariable=self.total_var, font=('Arial', 12, 'bold')).pack(side="left", padx=10)
        ctk.CTkLabel(right_payment, textvariable=self.balance_var, font=('Arial', 12, 'bold')).pack(side="left", padx=10)
        
        # Buttons
        ctk.CTkButton(right_payment, text="Save Receipt", command=self.save_receipt, width=100).pack(side="left", padx=5)
        ctk.CTkButton(right_payment, text="Cancel", command=lambda: self.controller.show_frame("HomeFrame"), width=100).pack(side="left", padx=5)
        
        # Bind payment updates
        self.discount_var.trace_add("write", lambda *args: self.update_total())
        self.advance_var.trace_add("write", lambda *args: self.update_total())
        self.num_discount_var.trace_add("write", lambda *args: self.update_total())

    def add_assurance_tax(self):
        dialog = ctk.CTkToplevel(self)
        dialog.title("Add Assurance Tax")
        dialog.geometry("400x200")
        
        # Make the dialog modal
        dialog.grab_set()
        
        # Center the dialog on screen
        dialog.update_idletasks()
        x = (dialog.winfo_screenwidth() - dialog.winfo_reqwidth()) / 2
        y = (dialog.winfo_screenheight() - dialog.winfo_reqheight()) / 2
        dialog.geometry(f"+{int(x)}+{int(y)}")
        
        # Force focus on the dialog
        dialog.focus_force()
        
        ctk.CTkLabel(dialog, text="Base Amount:").pack(pady=15)
        amount_entry = ctk.CTkEntry(dialog, width=300)
        amount_entry.pack(pady=5)
        
        # Set focus on the entry field
        amount_entry.focus()
        
        def save():
            try:
                base_amount = float(amount_entry.get())
                if base_amount >= 0:
                    tax_amount = base_amount * 0.10  # Calculate 10%
                    self.add_item_to_receipt("Assurance Tax", tax_amount)
                    dialog.destroy()
                else:
                    messagebox.showerror("Error", "Amount must be positive")
            except ValueError:
                messagebox.showerror("Error", "Invalid amount format")
        
        ctk.CTkButton(dialog, text="Calculate & Add", command=save, width=200).pack(pady=30)
    def add_item(self):
        product_name = self.product_var.get()
        try:
            qty = int(self.qty_var.get())
            if qty < 1:
                raise ValueError
        except ValueError:
            messagebox.showerror("Error", "Invalid quantity")
            return
        
        products = self.data_manager.get_products()
        product = next((p for p in products if p['name'] == product_name), None)
        if not product:
            messagebox.showerror("Error", "Product not found")
            return
        
        self.add_item_to_receipt(product_name, product['price'], qty)
    def create_prescription_field(self, parent, label):
        frame = ctk.CTkFrame(parent)
        frame.pack(padx=2, pady=2)
        ctk.CTkLabel(frame, text=label).pack(side="left")
        entry = ctk.CTkEntry(frame, width=50)
        entry.pack(side="left")
        return entry
    def handle_click(self, event):
        region = self.tree.identify_region(event.x, event.y)
        if region == "cell":
            column = self.tree.identify_column(event.x)
            if column == "#5":  # Delete column
                item = self.tree.identify_row(event.y)
                if item:
                    self.delete_item(item)

    def delete_item(self, item):
        idx = self.tree.index(item)
        self.receipt_items.pop(idx)
        self.tree.delete(item)
        self.update_total()

    def add_custom_product(self):
        dialog = ctk.CTkToplevel(self)
        dialog.title("Add Custom Product")
        dialog.geometry("400x300")
        
        # Make the dialog modal (block interaction with main window)
        dialog.grab_set()
        
        # Center the dialog on screen
        dialog.update_idletasks()
        x = (dialog.winfo_screenwidth() - dialog.winfo_reqwidth()) / 2
        y = (dialog.winfo_screenheight() - dialog.winfo_reqheight()) / 2
        dialog.geometry(f"+{int(x)}+{int(y)}")
        
        # Force focus on the dialog
        dialog.focus_force()
        
        ctk.CTkLabel(dialog, text="Product Name:").pack(pady=15)
        name_entry = ctk.CTkEntry(dialog, width=300)
        name_entry.pack(pady=5)
        
        ctk.CTkLabel(dialog, text="Price:").pack(pady=15)
        price_entry = ctk.CTkEntry(dialog, width=300)
        price_entry.pack(pady=5)
        
        # Set focus on the first entry field
        name_entry.focus()
        
        def save():
            try:
                name = name_entry.get()
                price = float(price_entry.get())
                if name and price >= 0:
                    self.add_item_to_receipt(name, price)
                    dialog.destroy()
                else:
                    messagebox.showerror("Error", "Invalid input")
            except ValueError:
                messagebox.showerror("Error", "Invalid price format")
        
        ctk.CTkButton(dialog, text="Add", command=save, width=200).pack(pady=30)

    def add_item_to_receipt(self, product_name, price, qty=1):
        total = price * qty
        self.receipt_items.append({
            'product': product_name,
            'quantity': qty,
            'price': price,
            'total': total
        })
        
        self.tree.insert('', tk.END, values=(
            product_name,
            qty,
            f"${price:.2f}",
            f"${total:.2f}",
            "❌"
        ))
        self.update_total()

    def update_total(self):
        subtotal = sum(item['total'] for item in self.receipt_items)
        try:
            discount = float(self.discount_var.get() or 0)
            num_discount = float(self.num_discount_var.get() or 0)
            advance = float(self.advance_var.get() or 0)
        except ValueError:
            discount = 0
            num_discount = 0
            advance = 0
            
        total_after_percent = subtotal * (1 - discount/100)
        total = max(total_after_percent - num_discount, 0)  # Prevent negative totals
        balance = total - advance
        
        self.total_var.set(f"Total: ${total:.2f}")
        self.balance_var.set(f"Balance Due: ${balance:.2f}")

    def edit_item(self, event):
        item = self.tree.selection()[0]
        if not item:
            return
            
        column = self.tree.identify_column(event.x)
        values = self.tree.item(item)['values']
        idx = self.tree.index(item)
        
        dialog = ctk.CTkToplevel(self)
        dialog.title("Edit Item")
        dialog.geometry("400x300")  # Increased size
        
        # Center the dialog on screen
        dialog.update_idletasks()
        x = (dialog.winfo_screenwidth() - dialog.winfo_reqwidth()) / 2
        y = (dialog.winfo_screenheight() - dialog.winfo_reqheight()) / 2
        dialog.geometry(f"+{int(x)}+{int(y)}")
        
        ctk.CTkLabel(dialog, text="Product Name:").pack(pady=15)
        name_entry = ctk.CTkEntry(dialog, width=300)
        name_entry.insert(0, values[0])
        name_entry.pack(pady=5)
        
        ctk.CTkLabel(dialog, text="Quantity:").pack(pady=15)
        qty_entry = ctk.CTkEntry(dialog, width=300)
        qty_entry.insert(0, values[1])
        qty_entry.pack(pady=5)
        
        ctk.CTkLabel(dialog, text="Price:").pack(pady=15)
        price_entry = ctk.CTkEntry(dialog, width=300)
        price_entry.insert(0, values[2].replace('$', ''))
        price_entry.pack(pady=5)
        
        def save():
            try:
                name = name_entry.get()
                qty = int(qty_entry.get())
                price = float(price_entry.get())
                if name and qty > 0 and price >= 0:
                    total = qty * price
                    self.tree.item(item, values=(name, qty, f"${price:.2f}", f"${total:.2f}", "❌"))
                    self.receipt_items[idx] = {
                        'product': name,
                        'quantity': qty,
                        'price': price,
                        'total': total
                    }
                    self.update_total()
                    dialog.destroy()
                else:
                    messagebox.showerror("Error", "Invalid input")
            except ValueError:
                messagebox.showerror("Error", "Invalid number format")
        
        ctk.CTkButton(dialog, text="Save", command=save, width=200).pack(pady=30)

    def save_receipt(self):
        if not self.receipt_items:
            messagebox.showerror("Error", "No items in receipt")
            return
        
        try:
            advance = float(self.advance_var.get() or 0)
        except ValueError:
            advance = 0
            
        receipt = {
            'date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'client_name': self.client_name.get(),
            'client_phone': self.client_phone.get(),
            'right_eye': {
                'sph': self.right_sph.get(),
                'cyl': self.right_cyl.get(),
                'axe': self.right_axe.get()
            },
            'left_eye': {
                'sph': self.left_sph.get(),
                'cyl': self.left_cyl.get(),
                'axe': self.left_axe.get()
            },
            'items': self.receipt_items,
            'subtotal': sum(item['total'] for item in self.receipt_items),
            'discount': float(self.discount_var.get() or 0),
            'numerical_discount': float(self.num_discount_var.get() or 0),
            'advance_payment': advance,
            'total': sum(item['total'] for item in self.receipt_items) * (1 - float(self.discount_var.get() or 0)/100),
            'balance_due': sum(item['total'] for item in self.receipt_items) * (1 - float(self.discount_var.get() or 0)/100) - advance
        }
        
        self.data_manager.save_receipt(receipt)
        self.generate_pdf(receipt)
        messagebox.showinfo("Success", "Receipt saved successfully")
        self.controller.show_frame("HomeFrame")
   
    def generate_pdf(self, receipt):
        file_path = filedialog.asksaveasfilename(
            defaultextension=".pdf",
            filetypes=[("PDF Files", "*.pdf")]
        )
        if file_path:
            generate_pdf_from_receipt(receipt, file_path)
    def on_show(self):
        # Reset form when navigating to this frame
        self.receipt_items = []
        self.tree.delete(*self.tree.get_children())
        self.client_name.delete(0, tk.END)
        self.client_phone.delete(0, tk.END)
        self.discount_var.set("")
        self.advance_var.set("0")
        self.total_var.set("Total: $0.00")
        self.balance_var.set("Balance Due: $0.00")
        
        # Refresh product list
        products = [p['name'] for p in self.data_manager.get_products()]
        self.product_cb.configure(values=products)
        self.num_discount_var.set("")

class ReceiptHistory(ctk.CTkFrame):
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller
        self.data_manager = DataManager()
        
        # Create widgets
        self.tree = ttk.Treeview(self, columns=('Date', 'Client', 'Total'), show='headings')
        self.tree.heading('Date', text='Date')
        self.tree.heading('Client', text='Client')
        self.tree.heading('Total', text='Total')
        
        # Add scrollbar
        scrollbar = ttk.Scrollbar(self, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        btn_frame = ctk.CTkFrame(self)
        ctk.CTkButton(btn_frame, text="View Details", command=self.view_details).pack(side="left", padx=5)
        ctk.CTkButton(btn_frame, text="Delete", command=self.delete_receipt).pack(side="left", padx=5)
        ctk.CTkButton(btn_frame, text="Save as PDF", command=self.save_as_pdf).pack(side="left", padx=5)

        
        # Layout
        scrollbar.pack(side="right", fill="y")
        self.tree.pack(fill="both", expand=True, padx=20, pady=10)
        btn_frame.pack(pady=10)
        
        # Bind double-click event
        self.tree.bind('<Double-1>', lambda e: self.view_details())
        
        self.load_receipts()
        
    def save_as_pdf(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showerror("Error", "No receipt selected")
            return
        total_items = len(self.data_manager.get_receipts())
        selected_index = total_items - self.tree.index(selected[0]) - 1
        receipt = self.data_manager.get_receipts()[selected_index]
        
        file_path = filedialog.asksaveasfilename(
            defaultextension=".pdf",
            filetypes=[("PDF Files", "*.pdf")]
        )
        if file_path:
            generate_pdf_from_receipt(receipt, file_path)
            messagebox.showinfo("Success", "PDF saved successfully")

    def on_show(self):
        self.load_receipts()

    def load_receipts(self):
        for item in self.tree.get_children():
            self.tree.delete(item)
        receipts = self.data_manager.get_receipts()
        # Insert receipts in reverse order (newest first)
        for receipt in reversed(receipts):
            self.tree.insert('', 0, values=(
                receipt['date'],
                receipt['client_name'],
                f"${receipt['total']:.2f}",
                f"-{receipt['discount']}%/-${receipt['numerical_discount']:.2f}"
            ))
        # Update tree columns
        self.tree.configure(columns=('Date', 'Client', 'Total', 'Discounts'))
        self.tree.heading('Discounts', text='Discounts Applied')


    def delete_receipt(self):
        selected = self.tree.selection()
        if not selected:
            return
        
        if messagebox.askyesno("Confirm Delete", "Are you sure you want to delete this receipt?"):
            # Get the total number of items and subtract the selected index from it
            total_items = len(self.data_manager.get_receipts())
            selected_index = total_items - self.tree.index(selected[0]) - 1  # Reverse the index
            
            self.data_manager.delete_receipt(selected_index)
            self.load_receipts()

    def view_details(self):
        selected = self.tree.selection()
        if not selected:
            return
            
        # Get the total number of items and subtract the selected index from it
        total_items = len(self.data_manager.get_receipts())
        selected_index = total_items - self.tree.index(selected[0]) - 1  # Reverse the index
        
        receipt = self.data_manager.get_receipts()[selected_index]
        ReceiptDetails(self, receipt, selected_index)

class ReceiptDetails(ctk.CTkToplevel):
    def __init__(self, parent, receipt, receipt_index):
        super().__init__(parent)
        self.parent = parent
        self.receipt = receipt
        self.receipt_index = receipt_index
        self.title("Receipt Details")
        self.geometry("600x500")
        
        main_frame = ctk.CTkFrame(self)
        main_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Client Information
        client_frame = ctk.CTkFrame(main_frame)
        client_frame.pack(fill="x", pady=5)
        
        ctk.CTkLabel(client_frame, text="Name:").grid(row=0, column=0, padx=5)
        self.name_entry = ctk.CTkEntry(client_frame)
        self.name_entry.insert(0, receipt['client_name'])
        self.name_entry.grid(row=0, column=1, padx=5)
        
        ctk.CTkLabel(client_frame, text="Phone:").grid(row=0, column=2, padx=5)
        self.phone_entry = ctk.CTkEntry(client_frame)
        self.phone_entry.insert(0, receipt['client_phone'])
        self.phone_entry.grid(row=0, column=3, padx=5)
        
        # Prescription
        pres_frame = ctk.CTkFrame(main_frame)
        pres_frame.pack(fill="x", pady=5)
        
        # Right Eye
        right_frame = ctk.CTkFrame(pres_frame)
        right_frame.pack(side="left", padx=5)
        ctk.CTkLabel(right_frame, text="Right Eye").pack()
        self.right_sph = self.create_entry(right_frame, "SPH:", receipt['right_eye']['sph'])
        self.right_cyl = self.create_entry(right_frame, "CYL:", receipt['right_eye']['cyl'])
        self.right_axe = self.create_entry(right_frame, "AXE:", receipt['right_eye']['axe'])
        
        # Left Eye
        left_frame = ctk.CTkFrame(pres_frame)
        left_frame.pack(side="left", padx=5)
        ctk.CTkLabel(left_frame, text="Left Eye").pack()
        self.left_sph = self.create_entry(left_frame, "SPH:", receipt['left_eye']['sph'])
        self.left_cyl = self.create_entry(left_frame, "CYL:", receipt['left_eye']['cyl'])
        self.left_axe = self.create_entry(left_frame, "AXE:", receipt['left_eye']['axe'])
        
        # Items
        items_frame = ctk.CTkScrollableFrame(main_frame, height=200)
        items_frame.pack(fill="x", pady=5)
        
        self.item_entries = []
        for item in receipt['items']:
            self.add_item_entry(items_frame, item)
        
        # Payment Information
        payment_frame = ctk.CTkFrame(main_frame)
        payment_frame.pack(fill="x", pady=5)
        
        # Percentage Discount
        ctk.CTkLabel(payment_frame, text="Discount (%):").pack(side="left")
        self.discount_entry = ctk.CTkEntry(payment_frame, width=70)
        self.discount_entry.insert(0, str(receipt['discount']))
        self.discount_entry.pack(side="left", padx=5)
        
        # Numerical Discount
        ctk.CTkLabel(payment_frame, text="Discount ($):").pack(side="left", padx=(20,0))
        self.num_discount_entry = ctk.CTkEntry(payment_frame, width=70)
        self.num_discount_entry.insert(0, str(receipt.get('numerical_discount', 0)))
        self.num_discount_entry.pack(side="left", padx=5)
        
        # Advance Payment
        ctk.CTkLabel(payment_frame, text="Advance:").pack(side="left", padx=(20,0))
        self.advance_entry = ctk.CTkEntry(payment_frame, width=100)
        self.advance_entry.insert(0, str(receipt['advance_payment']))
        self.advance_entry.pack(side="left", padx=5)

        
        # Buttons
        btn_frame = ctk.CTkFrame(main_frame)
        btn_frame.pack(pady=10)
        ctk.CTkButton(btn_frame, text="Save Changes", command=self.save_changes).pack(side="left", padx=5)
        ctk.CTkButton(btn_frame, text="Close", command=self.destroy).pack(side="left", padx=5)

    def create_entry(self, parent, label, value):
        frame = ctk.CTkFrame(parent)
        frame.pack(fill="x", pady=2)
        ctk.CTkLabel(frame, text=label).pack(side="left")
        entry = ctk.CTkEntry(frame, width=70)
        entry.insert(0, value)
        entry.pack(side="left", padx=5)
        return entry

    def add_item_entry(self, parent, item):
        frame = ctk.CTkFrame(parent)
        frame.pack(fill="x", pady=2)
        
        name_entry = ctk.CTkEntry(frame, width=200)
        name_entry.insert(0, item['product'])
        name_entry.pack(side="left", padx=5)
        
        qty_entry = ctk.CTkEntry(frame, width=50)
        qty_entry.insert(0, str(item['quantity']))
        qty_entry.pack(side="left", padx=5)
        
        price_entry = ctk.CTkEntry(frame, width=100)
        price_entry.insert(0, str(item['price']))
        price_entry.pack(side="left", padx=5)
        
        self.item_entries.append((name_entry, qty_entry, price_entry))

    def save_changes(self):
        try:
            # Update receipt with new values
            self.receipt['client_name'] = self.name_entry.get()
            self.receipt['client_phone'] = self.phone_entry.get()
            
            self.receipt['right_eye'] = {
                'sph': self.right_sph.get(),
                'cyl': self.right_cyl.get(),
                'axe': self.right_axe.get()
            }
            
            self.receipt['left_eye'] = {
                'sph': self.left_sph.get(),
                'cyl': self.left_cyl.get(),
                'axe': self.left_axe.get()
            }
            
            # Update items
            self.receipt['items'] = []
            for name_entry, qty_entry, price_entry in self.item_entries:
                qty = int(qty_entry.get())
                price = float(price_entry.get())
                total = qty * price
                self.receipt['items'].append({
                    'product': name_entry.get(),
                    'quantity': qty,
                    'price': price,
                    'total': total
                })
            
            # Update payment information
            self.receipt['discount'] = float(self.discount_entry.get())
            self.receipt['advance_payment'] = float(self.advance_entry.get())
            self.receipt['numerical_discount'] = float(self.num_discount_entry.get())

            
            # Recalculate totals
            subtotal = sum(item['total'] for item in self.receipt['items'])
            total_after_percent = subtotal * (1 - self.receipt['discount']/100)
            self.receipt['total'] = max(total_after_percent - self.receipt['numerical_discount'], 0)
            self.receipt['balance_due'] = self.receipt['total'] - self.receipt['advance_payment']
            
            # Save changes
            self.parent.data_manager.update_receipt(self.receipt_index, self.receipt)
            self.parent.load_receipts()
            
            messagebox.showinfo("Success", "Changes saved successfully")
            self.destroy()
            
        except ValueError as e:
            messagebox.showerror("Error", "Invalid number format in one or more fields")
def generate_pdf_from_receipt(receipt, file_path):
    pdf = canvas.Canvas(file_path, pagesize=A4)
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(100, 800, "Lens Optic Receipt")
    
    pdf.setFont("Helvetica", 12)
    y = 750
    pdf.drawString(100, y, f"Date: {receipt['date']}")
    pdf.drawString(300, y, f"Client: {receipt['client_name']}")
    y -= 20
    pdf.drawString(100, y, f"Phone: {receipt['client_phone']}")
    y -= 30
    
    # Prescription Information
    pdf.drawString(100, y, "Prescription:")
    y -= 20
    pdf.drawString(120, y, "Right Eye:")
    pdf.drawString(220, y, f"SPH: {receipt['right_eye']['sph']}  CYL: {receipt['right_eye']['cyl']}  AXE: {receipt['right_eye']['axe']}")
    y -= 20
    pdf.drawString(120, y, "Left Eye:")
    pdf.drawString(220, y, f"SPH: {receipt['left_eye']['sph']}  CYL: {receipt['left_eye']['cyl']}  AXE: {receipt['left_eye']['axe']}")
    y -= 30
    
    # Items
    pdf.drawString(100, y, "Items:")
    y -= 20
    for item in receipt['items']:
        pdf.drawString(120, y, f"{item['product']} x{item['quantity']} @ ${item['price']:.2f}")
        pdf.drawString(400, y, f"${item['total']:.2f}")
        y -= 20
    
    # Payment Information
    y -= 20
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(100, y, f"Subtotal: ${receipt['subtotal']:.2f}")
    y -= 20
    pdf.drawString(100, y, f"Percentage Discount: {receipt['discount']}%")
    y -= 20
    pdf.drawString(100, y, f"Fixed Discount: ${receipt['numerical_discount']:.2f}")
    y -= 20
    pdf.drawString(100, y, f"Total: ${receipt['total']:.2f}")
    y -= 20
    pdf.drawString(100, y, f"Advance Payment: ${receipt['advance_payment']:.2f}")
    y -= 20
    pdf.drawString(100, y, f"Balance Due: ${receipt['balance_due']:.2f}")

    # Footer
    y -= 40
    pdf.setFont("Helvetica", 10)
    if receipt['balance_due'] > 0:
        pdf.drawString(100, y, "Note: Balance payment is due upon delivery of the product.")
    else:
        pdf.drawString(100, y, "Note: Full payment has been received. Thank you for your business!")
    
    pdf.save()
if __name__ == "__main__":
    app = MainApplication() 
    app.mainloop()  
