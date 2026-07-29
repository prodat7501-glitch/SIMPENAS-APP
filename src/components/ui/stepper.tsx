import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number; // 0-indexed
  completeCurrentStep?: boolean;
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  completeCurrentStep = false,
  className,
}: StepperProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full p-6 border border-border bg-card rounded-2xl",
        className,
      )}
    >
      {steps.map((step, idx) => {
        const isCompleted =
          idx < currentStep || (completeCurrentStep && idx === currentStep);
        const isActive = idx === currentStep && !completeCurrentStep;

        return (
          <div
            key={step.label}
            className="flex-1 flex items-center gap-3 w-full relative"
          >
            {/* Step icon/number */}
            <div
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all border",
                isCompleted && "bg-success border-success text-white",
                isActive &&
                  "bg-primary border-primary text-white shadow-sm ring-4 ring-primary/20",
                !isCompleted &&
                  !isActive &&
                  "bg-muted border-border text-muted-foreground",
              )}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
            </div>

            {/* Step Label */}
            <div className="text-xs">
              <p
                className={cn(
                  "font-bold text-foreground",
                  !isCompleted && !isActive && "text-muted-foreground",
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                  {step.description}
                </p>
              )}
            </div>

            {/* Divider line for desktop */}
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "hidden xl:block absolute left-[80%] right-[-20%] top-1/2 -translate-y-1/2 h-[1.5px]",
                  idx < currentStep ? "bg-success" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
