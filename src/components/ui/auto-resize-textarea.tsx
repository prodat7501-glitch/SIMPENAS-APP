import * as React from "react";
import { cn } from "@/lib/utils";

export interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  minRows?: number;
}

const resizeTextarea = (element: HTMLTextAreaElement | null) => {
  if (!element) return;
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
};

const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(
  (
    { className, error, minRows = 3, onInput, disabled, ...props },
    forwardedRef,
  ) => {
    const internalRef = React.useRef<HTMLTextAreaElement | null>(null);

    const setRefs = React.useCallback(
      (element: HTMLTextAreaElement | null) => {
        internalRef.current = element;
        if (typeof forwardedRef === "function") forwardedRef(element);
        else if (forwardedRef) forwardedRef.current = element;
        resizeTextarea(element);
      },
      [forwardedRef],
    );

    React.useLayoutEffect(() => {
      resizeTextarea(internalRef.current);
    });

    return (
      <textarea
        ref={setRefs}
        rows={minRows}
        disabled={disabled}
        aria-invalid={error || undefined}
        onInput={(event) => {
          resizeTextarea(event.currentTarget);
          onInput?.(event);
        }}
        className={cn(
          "flex min-h-[4.75rem] w-full resize-none overflow-hidden rounded-xl border border-input bg-background px-3 py-2.5 text-sm leading-relaxed ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-[height,border-color,box-shadow] duration-150 [field-sizing:content]",
          error && "border-danger focus-visible:ring-danger/20",
          className,
        )}
        {...props}
      />
    );
  },
);

AutoResizeTextarea.displayName = "AutoResizeTextarea";

export { AutoResizeTextarea };
