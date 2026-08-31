import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-[28px] bg-paper shadow-[0_12px_40px_rgba(28,20,18,0.06)]", className)}>
      {children}
    </div>
  );
}
