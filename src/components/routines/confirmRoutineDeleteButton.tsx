"use client";

import {useFormStatus} from "react-dom";

import Icon from "@/components/layout/actionComponents/iconComponent";

type ConfirmRoutineDeleteButtonProps = {
    routineName: string;
};

export default function ConfirmRoutineDeleteButton({
    routineName,
}: ConfirmRoutineDeleteButtonProps) {
    const {pending} = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            aria-label={`Delete ${routineName}`}
            onClick={(event) => {
                if (!window.confirm(
                    `Delete “${routineName}”? This cannot be undone.`,
                )) {
                    event.preventDefault();
                }
            }}
            className="grid size-8 place-items-center rounded-full text-primary transition hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger disabled:cursor-wait disabled:opacity-50"
        >
            {pending ? (
                <span className="size-4 animate-spin rounded-full border border-current border-t-transparent" />
            ) : (
                <Icon name="delete" className="size-4" strokeWidth={1.25}/>
            )}
        </button>
    );
}
