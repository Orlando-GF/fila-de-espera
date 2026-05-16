"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type Props = {
  ariaLabel: string;
  children: ReactNode;
  className: string;
  panelClassName: string;
  title?: string;
  trigger: ReactNode;
};

export function DropdownPanel({
  ariaLabel,
  children,
  className,
  panelClassName,
  title,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function closeOnOutsideClick(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-controls={open ? panelId : undefined}
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-haspopup="true"
        className={className}
        title={title ?? ariaLabel}
        onClick={() => setOpen((current) => !current)}
      >
        {trigger}
      </button>
      <div id={panelId} className={[panelClassName, open ? "" : "hidden"].join(" ")} aria-hidden={!open}>
        {children}
      </div>
    </div>
  );
}
