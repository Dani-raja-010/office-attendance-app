import Image from "next/image";
import { cn, initials } from "@/lib/utils";

export function Avatar({ name, image, className }: { name: string; image?: string | null; className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary)_16%,white),color-mix(in_oklch,var(--accent-2)_18%,white))] text-xs font-bold text-primary ring-2 ring-white",
        className,
      )}
    >
      {image ? <Image src={image} alt="" fill sizes="40px" className="object-cover" /> : initials(name)}
    </span>
  );
}
