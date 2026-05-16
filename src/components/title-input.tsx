"use client";

import { capitalizeWords } from "@/lib/text";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  allowNumbers?: boolean;
};

export function TitleInput({ allowNumbers = false, onBlur, onChange, ...props }: Props) {
  return (
    <input
      {...props}
      onChange={(event) => {
        const value = allowNumbers ? event.currentTarget.value : event.currentTarget.value.replace(/\d/g, "");
        event.currentTarget.value = capitalizeWords(value);
        onChange?.(event);
      }}
      onBlur={(event) => {
        const value = allowNumbers ? event.currentTarget.value : event.currentTarget.value.replace(/\d/g, "");
        event.currentTarget.value = capitalizeWords(value).trim();
        onBlur?.(event);
      }}
    />
  );
}
