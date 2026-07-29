"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/**
 * A single, accessible accordion row with a smooth grid-rows height transition
 * (see `.acc-panel` in globals.css). The chevron rotates into an "x" when open.
 */
export function AccordionItem({ title, defaultOpen = false, children }: AccordionItemProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const panelId = React.useId();
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="font-serif text-[15px] text-navy">{title}</span>
        <Plus
          className={cn(
            "h-4 w-4 shrink-0 text-accent transition-transform duration-300",
            open && "rotate-45"
          )}
        />
      </button>
      {/* `inert` (React 19) removes the visually-clipped panel from the tab order
          and the accessibility tree while collapsed; it's dropped when open so it
          never interferes with the grid-rows height transition. */}
      <div id={panelId} className="acc-panel" data-open={open} inert={open ? undefined : true}>
        <div>
          <div className="pb-5 pr-2">{children}</div>
        </div>
      </div>
    </div>
  );
}
