import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
    auth: vi.fn(),
    getProfileByUserId: vi.fn(),
    revalidatePath: vi.fn(),
    upsertMeasurementForUser: vi.fn(),
}));

vi.mock("@/auth", () => ({
    auth: mocks.auth,
}));

vi.mock("@/db/profile", () => ({
    getProfileByUserId:
    mocks.getProfileByUserId,
}));

vi.mock("@/db/measurements", () => ({
    upsertMeasurementForUser:
    mocks.upsertMeasurementForUser,
}));

vi.mock("next/cache", () => ({
    revalidatePath: mocks.revalidatePath,
}));

import {saveMeasurementAction} from "@/app/(protected)/measurements/actions";

function createMeasurementFormData() {
    const formData = new FormData();

    formData.set(
        "measuredOn",
        "2026-11-02",
    );
    formData.set("weight", "220.46");
    formData.set("waist", "10");

    return formData;
}

describe("saveMeasurementAction", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.auth.mockResolvedValue({
            user: {
                id: "user-1",
            },
        });

        mocks.getProfileByUserId.mockResolvedValue({
            weightUnit: "lb",
            measurementUnit: "in",
        });

        mocks.upsertMeasurementForUser.mockResolvedValue({
            id: "measurement-1",
            measuredOn: "2026-11-02",
        });
    });

    it("rejects unauthenticated requests", async () => {
        mocks.auth.mockResolvedValue(null);

        await expect(
            saveMeasurementAction(
                createMeasurementFormData(),
            ),
        ).rejects.toThrow("Unauthorized");

        expect(
            mocks.upsertMeasurementForUser,
        ).not.toHaveBeenCalled();
    });

    it("normalizes values using the user's unit preferences", async () => {
        await saveMeasurementAction(
            createMeasurementFormData(),
        );

        expect(
            mocks.upsertMeasurementForUser,
        ).toHaveBeenCalledWith(
            "user-1",
            {
                measuredOn: "2026-11-02",
                weight: 100,
                waist: 25.4,
                chest: null,
                hips: null,
                thigh: null,
                arm: null,
            },
        );
    });

    it("revalidates affected pages and returns the saved entry", async () => {
        await expect(
            saveMeasurementAction(
                createMeasurementFormData(),
            ),
        ).resolves.toEqual({
            id: "measurement-1",
            measuredOn: "2026-11-02",
        });

        expect(
            mocks.revalidatePath,
        ).toHaveBeenCalledWith(
            "/measurements",
        );
        expect(
            mocks.revalidatePath,
        ).toHaveBeenCalledWith(
            "/dashboard",
        );
    });

    it("reports a database save failure", async () => {
        mocks.upsertMeasurementForUser.mockResolvedValue(
            null,
        );

        await expect(
            saveMeasurementAction(
                createMeasurementFormData(),
            ),
        ).rejects.toThrow(
            "Unable to save measurement",
        );
    });
});