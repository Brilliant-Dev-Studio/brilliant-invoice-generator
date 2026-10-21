"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { inputValidationMessage } from "@/lib/input-validation";
import { useTranslations } from "../language-provider";
export function Input({ className, ...props }: React.ComponentProps<"input">) {
  const t = useTranslations();
  const id = React.useId();
  const [error, setError] = React.useState("");
  function validate(field: HTMLInputElement) {
    setError(
      field.validity.valid ? "" : inputValidationMessage(field.validity),
    );
  }
  return (
    <>
      <input
        className={cn("input", className)}
        {...props}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={
          [props["aria-describedby"], error ? id : ""]
            .filter(Boolean)
            .join(" ") || undefined
        }
        onInvalid={(event) => {
          validate(event.currentTarget);
          props.onInvalid?.(event);
        }}
        onBlur={(event) => {
          validate(event.currentTarget);
          props.onBlur?.(event);
        }}
        onChange={(event) => {
          if (error) validate(event.currentTarget);
          props.onChange?.(event);
        }}
      />
      {error && (
        <span id={id} className="input-validation-error">
          {t(error)}
        </span>
      )}
    </>
  );
}
