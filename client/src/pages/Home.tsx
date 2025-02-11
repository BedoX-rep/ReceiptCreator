import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FileText, History } from "lucide-react";

export default function Home() {
  const cards = [
    {
      title: "Product Management",
      description: "Manage your product inventory",
      icon: Package,
      href: "/products"
    },
    {
      title: "New Receipt",
      description: "Generate a new receipt",
      icon: FileText,
      href: "/new-receipt"
    },
    {
      title: "Receipt History",
      description: "View and manage receipts",
      icon: History,
      href: "/receipts"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Welcome to Lens Optic</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        {cards.map(({ title, description, icon: Icon, href }) => (
          <Link key={href} href={href}>
            <a className="block group">
              <Card className="transition-shadow hover:shadow-lg">
                <CardHeader className="text-center">
                  <Icon className="h-12 w-12 mx-auto text-primary mb-4" />
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">
                    {description}
                  </p>
                </CardContent>
              </Card>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
