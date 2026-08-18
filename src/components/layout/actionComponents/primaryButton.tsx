import Icon from "@/components/layout/actionComponents/icon";
import type { ComponentProps } from "react";

type ButtonVariant = "primary" | "secondary";

type PrimaryButtonProps = {
    type?: "button" | "submit" | "reset";
    variant: ButtonVariant;
    label: string;
    onClick?: () => void;
    ariaLabel?: string;
    iconName?: ComponentProps<typeof Icon>["name"];
}

const variantClassNames: Record<ButtonVariant, string> = {
    primary: "border-surface-inverse bg-surface-inverse text-inverse hover:border-surface-inverse hover:bg-surface-inverse",
    secondary: "border-border text-primary hover:bg-surface-subtle",
};

export default function PrimaryButton({ type = "button", variant, label, onClick, ariaLabel, iconName }: PrimaryButtonProps) {
    const className = `flex h-14 w-full items-center justify-center gap-3 rounded-control border font-semibold transition ${variantClassNames[variant]}`;

    return (
        <button
            type={type}
            aria-label={ariaLabel}
            onClick={onClick}
            className={className}
        >
            {iconName && <Icon name={iconName} className="size-5 md:size-6" />}
            {label}
        </button>
    );
}
