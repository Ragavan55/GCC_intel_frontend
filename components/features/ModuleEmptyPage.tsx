import { ArrowRight, Database } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/features/AppShell";
import { Button, EmptyState } from "@/components/ui";

export function ModuleEmptyPage({ title, description }: { title: string; description: string }) {
  return <AppShell><div className="fade-up">
    <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent">Workspace / {title}</p>
    <h1 className="mt-2 font-display text-4xl sm:text-5xl">{title}</h1>
    <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>
    <div className="mt-8"><EmptyState title="No verified records yet" description="This view will populate from the source-aware India GCC dataset. The API and data work for this section is part of the next build phases." action={<Link href="/dashboard"><Button variant="secondary" icon={<Database size={16} />}>Back to overview <ArrowRight size={15} /></Button></Link>} /></div>
  </div></AppShell>;
}