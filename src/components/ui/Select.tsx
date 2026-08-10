"use client";

import { cn } from "@/lib/utils/cn";
import { Check, ChevronDown } from "lucide-react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type SelectOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  label?: ReactNode;
  id?: string;
  "aria-label"?: string;
};

type MenuPos = {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
};

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled = false,
  className,
  triggerClassName,
  label,
  id,
  "aria-label": ariaLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const autoId = useId();
  const listboxId = `${autoId}-listbox`;
  const triggerId = id ?? `${autoId}-trigger`;

  const enabledOptions = useMemo(
    () => options.filter((o) => !o.disabled),
    [options],
  );

  const selected = options.find((o) => o.value === value) ?? null;

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const openUp = spaceBelow < 220 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(
      160,
      Math.min(280, openUp ? spaceAbove : spaceBelow),
    );
    setMenuPos(
      openUp
        ? {
            bottom: window.innerHeight - rect.top + 6,
            left: rect.left,
            width: rect.width,
            maxHeight,
          }
        : {
            top: rect.bottom + 6,
            left: rect.left,
            width: rect.width,
            maxHeight,
          },
    );
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const onReposition = () => updatePosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        listRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const idx = enabledOptions.findIndex((o) => o.value === value);
    setActiveIndex(idx >= 0 ? idx : 0);
    requestAnimationFrame(() => {
      listRef.current?.focus();
    });
  }, [open, enabledOptions, value]);

  const commit = (next: string) => {
    onChange(next);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const moveActive = (delta: number) => {
    if (!enabledOptions.length) return;
    setActiveIndex((prev) => {
      const start = prev < 0 ? 0 : prev;
      return (start + delta + enabledOptions.length) % enabledOptions.length;
    });
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      setOpen(true);
    }
  };

  const onListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(enabledOptions.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = enabledOptions[activeIndex];
      if (option) commit(option.value);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  const menuStyle: CSSProperties | undefined = menuPos
    ? {
        position: "fixed",
        left: menuPos.left,
        width: menuPos.width,
        maxHeight: menuPos.maxHeight,
        zIndex: 80,
        ...(menuPos.bottom != null
          ? { bottom: menuPos.bottom, top: "auto" }
          : { top: menuPos.top }),
      }
    : undefined;

  const menu =
    open && mounted && menuPos
      ? createPortal(
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={
              activeIndex >= 0
                ? `${listboxId}-option-${enabledOptions[activeIndex]?.value}`
                : undefined
            }
            onKeyDown={onListKeyDown}
            style={menuStyle}
            className={cn(
              "overflow-auto rounded-xl border border-[var(--border)] bg-[var(--panel-elevated)] p-1 shadow-[0_18px_40px_-18px_rgba(17,23,27,0.5)] outline-none",
              "animate-fade-in",
            )}
          >
            {options.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-[var(--muted)]">
                No options
              </li>
            ) : (
              options.map((option) => {
                const selectedOption = option.value === value;
                const enabledIdx = enabledOptions.findIndex(
                  (o) => o.value === option.value,
                );
                const active =
                  enabledIdx === activeIndex && !option.disabled;

                return (
                  <li
                    key={option.value}
                    id={`${listboxId}-option-${option.value}`}
                    role="option"
                    aria-selected={selectedOption}
                    aria-disabled={option.disabled || undefined}
                    onMouseEnter={() => {
                      if (!option.disabled && enabledIdx >= 0) {
                        setActiveIndex(enabledIdx);
                      }
                    }}
                    onClick={() => {
                      if (!option.disabled) commit(option.value);
                    }}
                    className={cn(
                      "flex cursor-pointer items-start gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      option.disabled && "cursor-not-allowed opacity-40",
                      !option.disabled && active && "bg-[var(--accent-soft)]",
                      !option.disabled &&
                        !active &&
                        "hover:bg-[color-mix(in_srgb,var(--steel)_6%,transparent)]",
                      selectedOption && "font-medium text-[var(--fg)]",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{option.label}</span>
                      {option.description ? (
                        <span className="mt-0.5 block truncate text-xs text-[var(--muted)]">
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                    {selectedOption ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-strong)]" />
                    ) : (
                      <span className="mt-0.5 h-4 w-4 shrink-0" />
                    )}
                  </li>
                );
              })
            )}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      {label ? (
        <label
          htmlFor={triggerId}
          className="mb-1.5 block text-sm font-medium text-[var(--fg)]"
        >
          {label}
        </label>
      ) : null}

      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "flex w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel-elevated)] px-3 py-2.5 text-left text-sm text-[var(--fg)] outline-none transition",
          "hover:border-[var(--border-strong)]",
          "focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]",
          open && "border-[var(--accent)] ring-2 ring-[var(--accent-soft)]",
          disabled && "cursor-not-allowed opacity-50",
          triggerClassName,
        )}
      >
        <span
          className={cn(
            "min-w-0 truncate",
            !selected && "text-[var(--muted)]",
          )}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[var(--muted)] transition-transform duration-150",
            open && "rotate-180 text-[var(--accent-strong)]",
          )}
        />
      </button>

      {menu}
    </div>
  );
}
