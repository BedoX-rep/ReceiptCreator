import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Package, 
  FileText, 
  History,
  Glasses 
} from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/products", icon: Package, label: "Products" },
  { href: "/new-receipt", icon: FileText, label: "New Receipt" },
  { href: "/receipts", icon: History, label: "Receipt History" }
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <Glasses className="h-8 w-8 text-sidebar-primary" />
          <h1 className="text-2xl font-bold text-sidebar-primary">Lens Optic</h1>
        </div>

        <nav className="space-y-2">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}>
              <a
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location === href 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </a>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
