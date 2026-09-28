import { cn } from "@/utils/utils";
import { Eye, EyeOff, Lock, Mail, PenLine, Search } from "lucide-react";
import { ComponentProps, FC, memo, useState } from "react";

type InputProps = FC<
  Omit<ComponentProps<"input">, "size"> & {
    label?: string;
    icon?: boolean;
    variant?: "primary" | "secondary";
    size?: "sm" | "md";
  }
>;

export const InputGroup: InputProps = memo(
  ({
    label,
    icon,
    className,
    type,
    variant = "primary",
    size = "md",
    ...props
  }) => {
    const [view, setView] = useState(false);

    return (
      <div className="w-full">
        {!!label && (
          <label
            htmlFor={props.id}
            className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-300"
          >
            <span>{label}</span>
            {props.readOnly && (
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <Lock className="size-3 shrink-0 text-slate-400" />
                Fixed
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {icon && (
            <span
              className={cn(
                "absolute top-1/2 shrink-0 -translate-y-1/2 text-slate-500",
                {
                  "left-2.5 [&>svg]:size-3.5": size === "sm",
                  "left-3 [&>svg]:size-4": size === "md",
                },
              )}
            >
              {type === "password" ? (
                <Lock />
              ) : type === "email" ? (
                <Mail />
              ) : type === "search" ? (
                <Search />
              ) : (
                <PenLine />
              )}
            </span>
          )}
          <input
            type={type === "password" ? (view ? "text" : "password") : type}
            className={cn(
              "transition-300 w-full border px-3 text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none",
              {
                "border-slate-700/80 bg-slate-900/90": variant === "primary",
                "border-slate-800 bg-slate-950": variant === "secondary",
                "pl-8": icon && size === "sm",
                "pl-9": icon && size === "md",
                "pr-8": type === "password" && size === "sm",
                "pr-9": type === "password" && size === "md",
                "rounded-lg py-1.5 text-xs": size === "sm",
                "rounded-xl py-2 text-sm": size === "md",
              },
              className,
            )}
            {...props}
          />
          {type === "password" && (
            <button
              type="button"
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-500 [&>svg]:size-3.5"
              disabled={props.disabled}
              onClick={() => setView((prev) => !prev)}
            >
              {view ? <Eye /> : <EyeOff />}
            </button>
          )}
        </div>
      </div>
    );
  },
);
