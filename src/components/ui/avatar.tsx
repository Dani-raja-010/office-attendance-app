import Image from "next/image";
import { cn, initials } from "@/lib/utils";

export function Avatar({ name, image, className }: { name: string; image?: string | null; className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-xs font-semibold text-primary",
        className,
      )}
    >
      {image ? <Image src={image} alt="" fill sizes="40px" className="object-cover" /> : initials(name)}
    </span>
  );
}
