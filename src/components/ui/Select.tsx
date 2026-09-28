import { cn } from "@/utils/utils";
import { ComponentProps, FC, memo } from "react";

type SelectProps = FC<
  Omit<ComponentProps<"select">, "size"> & {
    label?: string;
    variant?: "primary" | "secondary";
    options?: { value: string; name: string }[];
    size?: "sm" | "md";
  }
>;

export const SelectGroup: SelectProps = memo(
  ({
    label,
    className,
    variant = "primary",
    size = "md",
    options,
    ...props
  }) => {
    return (
      <div className="w-full">
        {!!label && (
          <label
            htmlFor={props.id}
            className="mb-1 block text-xs font-semibold text-slate-300"
          >
            {label}
          </label>
        )}

        <select
          className={cn(
            "w-full border text-slate-200 focus:border-teal-500 focus:outline-none",
            {
              "border-slate-700/80 bg-slate-900/90": variant === "primary",
              "border-slate-800 bg-slate-950": variant === "secondary",
              "rounded-lg px-2.5 py-1 text-xs": size === "sm",
              "rounded-xl px-3 py-2 text-xs": size === "md",
            },
            className,
          )}
          {...props}
        >
          {options?.map((option, index) => (
            <option key={index} value={option.value}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    );
  },
);
