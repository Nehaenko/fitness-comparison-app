"use client";

import Icon from "@/components/layout/actionComponents/iconComponent";
import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

type ButtonVariant = "primary" | "secondary" | "brand" | "danger" | "ghost";

type PrimaryButtonProps = {
    type?: "button" | "submit" | "reset";
    variant: ButtonVariant;
    label: string;
    pendingLabel?: string;
    fullWidth?: boolean;
    onClickAction?: () => void;
    ariaLabel?: string;
    iconName?: ComponentProps<typeof Icon>["name"];
    compact?: boolean;
    iconOnly?: boolean;
}

const variantClassNames: Record<ButtonVariant, string> = {
    primary: "border-surface-inverse bg-surface-inverse text-inverse hover:border-surface-inverse hover:bg-surface-inverse",
    secondary: "border-border text-primary hover:bg-surface-subtle",
    brand: "border-brand-soft bg-brand-soft text-brand hover:bg-brand-soft-hover",
    danger: "border-danger-soft bg-danger-soft text-danger hover:border-danger",
    ghost: "border-transparent bg-transparent text-secondary hover:bg-surface-subtle hover:text-primary",
};

export default function PrimaryButton({
    type = "button",
    variant,
    label,
    pendingLabel = "Please wait...",
    fullWidth = true, onClickAction,
    ariaLabel,
    iconName,
    compact = false,
    iconOnly = false,
}: PrimaryButtonProps) {
    const { pending } = useFormStatus();
    const widthClassName = iconOnly
        ? compact ? "size-10" : "size-12"
        : fullWidth ? "w-full" : "w-auto px-4";
    const heightClassName = iconOnly ? "" : compact ? "h-10" : "h-12";
    const className = `flex items-center justify-center gap-2 rounded-control border font-semibold transition disabled:cursor-wait disabled:opacity-60 ${heightClassName} ${widthClassName} ${variantClassNames[variant]}`;

    return (
        <button
            type={type}
            aria-label={ariaLabel}
            onClick={onClickAction}
            disabled={pending}
            aria-busy={pending}
            className={className}
        >
            {pending ? (
                <span
                    aria-hidden="true"
                    className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                />
            ) : (
                iconName && <Icon name={iconName} className="size-5" />
            )}
            <span className={iconOnly ? "sr-only" : undefined}>
                {pending ? pendingLabel : label}
            </span>
        </button>
    );
}
