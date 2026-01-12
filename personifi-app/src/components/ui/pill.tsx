import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const pillVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs sm:text-sm font-semibold",
  {
    variants: {
      variant: {
        primary:
          "border-finance-green-light/60 bg-finance-green-light/40 text-finance-green",
        muted: "border-slate-200 bg-slate-100 text-slate-600",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
)

export interface PillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof pillVariants> {}

function Pill({ className, variant, ...props }: PillProps) {
  return <span className={cn(pillVariants({ variant }), className)} {...props} />
}

export { Pill, pillVariants }
