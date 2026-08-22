"use client";

import { Button, type ButtonProps } from "@kanada/ui";

export function ConfirmSubmitButton({
  confirmText,
  ...props
}: ButtonProps & { confirmText: string }) {
  return (
    <Button
      {...props}
      type="submit"
      onClick={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    />
  );
}
