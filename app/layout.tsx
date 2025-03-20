import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Toaster } from "sonner";
import { TOOLS } from "@/lib/constants";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "just build the damn thing.",
  description: "A collection of useful web tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-background p-4">
              <div className="mb-8 flex items-center justify-between">
                <Link href="/" className="font-bold hover:underline">
                  just build the damn thing.
                </Link>
                <ThemeToggle />
              </div>
              <nav className="space-y-1">
                {TOOLS.map((tool) => (
                  <Button
                    key={tool.href}
                    variant="ghost"
                    className="w-full justify-start cursor-pointer"
                    asChild
                  >
                    <Link href={tool.href}>
                      <tool.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                      {tool.name}
                    </Link>
                  </Button>
                ))}
              </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-8">{children}</main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
