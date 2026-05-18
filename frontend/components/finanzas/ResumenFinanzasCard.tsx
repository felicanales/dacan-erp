import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCLP } from "./finanzas-utils";

type Props = {
  label: string;
  value: number;
  format?: "clp" | "number";
  icon: LucideIcon;
  tone?: "default" | "warning";
};

export function ResumenFinanzasCard({
  label,
  value,
  format = "number",
  icon: Icon,
  tone = "default",
}: Props) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-white p-4",
        tone === "warning" ? "border-amber-200" : "border-gray-200"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4",
          tone === "warning" ? "text-amber-500" : "text-gray-400"
        )}
      />
      <p className="mt-3 text-2xl font-semibold text-gray-900">
        {format === "clp" ? formatCLP(value) : value}
      </p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}
