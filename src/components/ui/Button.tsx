import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "soft" | "dark";

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[15px] font-medium tracking-wide transition disabled:opacity-50",
        variant === "primary" && "bg-rose text-white shadow-[0_10px_24px_rgba(139,61,74,0.28)] hover:bg-rose-deep",
        variant === "ghost" && "bg-transparent text-ink hover:bg-blush/40",
        variant === "soft" && "bg-blush text-rose-deep hover:bg-blush/80",
        variant === "dark" && "bg-ink text-cream hover:bg-ink/90",
        className,
      )}
      {...props}
    />
  );
}
