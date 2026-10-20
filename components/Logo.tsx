import { cn } from "@/lib/utils";

/**
 * Logo da igreja. O arquivo fica em /public/logo.png — para trocar, basta
 * substituir esse arquivo (de preferência PNG ou SVG branco com fundo transparente).
 */
export function Logo({ className, alt = "Logo" }: { className?: string; alt?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.png" alt={alt} className={cn("h-7 w-auto select-none", className)} draggable={false} />
  );
}
