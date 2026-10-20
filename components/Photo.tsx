import { cn } from "@/lib/utils";

/**
 * Foto com degradê quente de fallback: se a imagem ainda não existir,
 * o fundo quente continua visível e o layout não quebra.
 */
export function Photo({
  src,
  className,
  shade = "b",
  zoom = true,
  children,
}: {
  src?: string;
  className?: string;
  shade?: "b" | "full" | "none";
  zoom?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "photo",
        zoom && "photo-zoom",
        shade === "b" && "shade-b",
        shade === "full" && "shade-full",
        className,
      )}
    >
      {src && (
        <div
          aria-hidden
          className="photo-layer"
          style={{ backgroundImage: `url("${src}")` }}
        />
      )}
      {children}
    </div>
  );
}
