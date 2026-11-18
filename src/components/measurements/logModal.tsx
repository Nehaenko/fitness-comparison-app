"use client";

import {useEffect, useRef, useState} from "react";

import {saveMeasurementAction} from "@/app/(protected)/measurements/actions";
import Icon from "@/components/layout/actionComponents/iconComponent";
import type {MeasurementUnit, WeightUnit} from "@/types/profile";

type LogModalProps = {
    defaultDate: string;
    weightUnit: WeightUnit;
    measurementUnit: MeasurementUnit;
};

const bodyFields = [
    {name: "waist", label: "Waist", placeholder: "e.g. 85"},
    {name: "chest", label: "Chest", placeholder: "e.g. 100"},
    {name: "hips", label: "Hips", placeholder: "e.g. 95"},
    {name: "thigh", label: "Thigh", placeholder: "e.g. 58"},
    {name: "arm", label: "Arm", placeholder: "e.g. 38"},
] as const;

export default function LogModal({
    defaultDate,
    weightUnit,
    measurementUnit,
}: LogModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLElement>(null);
    const dateInputRef = useRef<HTMLInputElement>(null);
    const isSavingRef = useRef(isSaving);

    useEffect(() => {
        isSavingRef.current = isSaving;
    }, [isSaving]);

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const trigger = triggerRef.current;
        const focusFrame = window.requestAnimationFrame(() => {
            dateInputRef.current?.focus();
        });

        const handleModalKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isSavingRef.current) {
                setError(null);
                setIsOpen(false);
                return;
            }

            if (event.key !== "Tab") {
                return;
            }

            const dialog = dialogRef.current;

            if (!dialog) {
                return;
            }

            const focusableElements = Array.from(
                dialog.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
                ),
            );

            const firstElement = focusableElements[0];
            const lastElement = focusableElements.at(-1);

            if (!firstElement || !lastElement) {
                event.preventDefault();
                return;
            }

            if (
                event.shiftKey &&
                document.activeElement === firstElement
            ) {
                event.preventDefault();
                lastElement.focus();
            } else if (
                !event.shiftKey &&
                document.activeElement === lastElement
            ) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        window.addEventListener("keydown", handleModalKeyDown);

        return () => {
            window.cancelAnimationFrame(focusFrame);
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleModalKeyDown);
            trigger?.focus();
        };
    }, [isOpen]);

    const closeModal = () => {
        if (isSaving) return;
        setError(null);
        setIsOpen(false);
    };

    const submitMeasurement = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();
        const form = event.currentTarget;
        setIsSaving(true);
        setError(null);

        try {
            await saveMeasurementAction(
                new FormData(form),
            );
            form.reset();
            setIsOpen(false);
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : "Unable to save measurement",
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label="Log measurements"
                className="grid size-12 shrink-0 place-items-center rounded-control bg-surface-inverse text-2xl font-light leading-none text-inverse transition hover:bg-surface-inverse-control"
            >
                <span aria-hidden="true">+</span>
            </button>

            {isOpen ? (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-backdrop backdrop-blur-[3px] sm:items-center sm:p-4">
                    <button
                        type="button"
                        aria-label="Close measurement form"
                        onClick={closeModal}
                        className="absolute inset-0"
                    />

                    <section
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="log-measurements-title"
                        className="relative z-10 flex max-h-[calc(100dvh-1rem)] w-full max-w-xl flex-col overflow-hidden rounded-t-panel bg-surface shadow-floating sm:rounded-panel"
                    >
                        <header className="flex shrink-0 items-center justify-between border-b border-divider px-5 py-5 sm:px-6">
                            <h2
                                id="log-measurements-title"
                                className="text-body font-semibold"
                            >
                                Log measurements
                            </h2>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={isSaving}
                                aria-label="Close measurement form"
                                className="grid size-9 place-items-center rounded-full text-primary transition hover:bg-surface-subtle disabled:opacity-50"
                            >
                                <Icon name="close" className="size-5"/>
                            </button>
                        </header>

                        <form
                            onSubmit={submitMeasurement}
                            className="min-h-0 overflow-x-hidden overflow-y-auto px-5 py-5 sm:px-6"
                        >
                            <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-x-4 gap-y-5">
                                <label className="col-span-2 min-w-0">
                                    <span className="form-label !font-normal !text-primary">Date</span>
                                    <input
                                        ref={dateInputRef}
                                        type="date"
                                        name="measuredOn"
                                        defaultValue={defaultDate}
                                        required
                                        className="form-control min-w-0 max-w-full appearance-none normal-case"
                                    />
                                </label>

                                <label className="min-w-0">
                                    <span className="form-label !font-normal !text-primary">
                                        Weight ({weightUnit})
                                    </span>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        name="weight"
                                        placeholder="e.g. 80"
                                        className="form-control"
                                    />
                                </label>

                                {bodyFields.map((field) => (
                                    <label key={field.name} className="min-w-0">
                                        <span className="form-label !font-normal !text-primary">
                                            {field.label} ({measurementUnit})
                                        </span>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            name={field.name}
                                            placeholder={field.placeholder}
                                            className="form-control"
                                        />
                                    </label>
                                ))}
                            </div>

                            {error ? (
                                <p
                                    role="alert"
                                    className="mt-4 rounded-control bg-danger-soft px-4 py-3 text-small text-danger"
                                >
                                    {error}
                                </p>
                            ) : null}

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="mt-7 h-13 w-full rounded-control bg-surface-inverse px-5 font-semibold text-inverse transition hover:bg-surface-inverse-control disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSaving ? "Saving..." : "Save entry"}
                            </button>
                        </form>
                    </section>
                </div>
            ) : null}
        </>
    );
}
