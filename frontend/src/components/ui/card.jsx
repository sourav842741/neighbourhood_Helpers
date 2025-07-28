// src/components/ui/card.jsx
import React from "react";
import { cn } from "@/lib/utils";

export const Card = ({ className, ...props }) => (
  <div className={cn("rounded-xl border bg-white text-black shadow", className)} {...props} />
);

export const CardContent = ({ className, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);

export const CardHeader = ({ className, ...props }) => (
  <div className={cn("p-6", className)} {...props} />
);

export const CardTitle = ({ className, ...props }) => (
  <h3 className={cn("text-lg font-semibold", className)} {...props} />
);
