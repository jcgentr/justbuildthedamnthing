import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { TOOLS } from "@/lib/constants";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">just build the damn thing.</h1>
        <p className="text-muted-foreground text-lg">
          A collection of useful web tools for developers and designers
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search tools..." className="pl-9" />
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group relative rounded-lg border p-6 hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <tool.icon className="h-5 w-5 text-primary flex-shrink-0" />
              <h2 className="font-semibold">{tool.name}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
