"use client";

import {
    type FocusEvent,
    type InputHTMLAttributes,
    useState,
} from "react";

type DecimalInputProps = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "defaultValue" | "inputMode" | "onChange" | "type" | "value"
> & {
    value: number | null;
    onValueChange: (value: number | null) => void;
};

const DECIMAL_INPUT_PATTERN = /^\d*(?:[.,]\d*)?$/;

export default function DecimalInput({
    value,
    onValueChange,
    onBlur,
    ...inputProps
}: DecimalInputProps) {
    const [draftValue, setDraftValue] = useState(
        value === null ? "" : String(value),
    );

    const handleChange = (nextValue: string) => {
        if (!DECIMAL_INPUT_PATTERN.test(nextValue)) {
            return;
        }

        setDraftValue(nextValue);

        const normalizedValue = nextValue.replace(",", ".");

        if (normalizedValue === "") {
            onValueChange(null);
            return;
        }

        if (normalizedValue.endsWith(".")) {
            return;
        }

        const parsedValue = Number(normalizedValue);

        if (Number.isFinite(parsedValue)) {
            onValueChange(parsedValue);
        }
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
        const normalizedValue = draftValue.replace(",", ".");

        if (normalizedValue === "" || normalizedValue === ".") {
            setDraftValue("");
            onValueChange(null);
        } else {
            const parsedValue = Number(normalizedValue);

            if (Number.isFinite(parsedValue)) {
                setDraftValue(String(parsedValue));
                onValueChange(parsedValue);
            }
        }

        onBlur?.(event);
    };

    return (
        <input
            {...inputProps}
            type="text"
            inputMode="decimal"
            value={draftValue}
            onChange={(event) => handleChange(event.currentTarget.value)}
            onBlur={handleBlur}
        />
    );
}
