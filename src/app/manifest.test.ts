import {describe, expect, it} from "vitest";

import manifest from "@/app/manifest";

describe("PWA manifest", () => {
    it("provides standalone install metadata and required icons", () => {
        const metadata = manifest();

        expect(metadata).toMatchObject({
            name: "Forma — Private fitness companion",
            short_name: "Forma",
            start_url: "/",
            scope: "/",
            display: "standalone",
        });
        expect(metadata.icons).toEqual(
            expect.arrayContaining([
                expect.objectContaining({sizes: "192x192"}),
                expect.objectContaining({sizes: "512x512"}),
                expect.objectContaining({purpose: "maskable"}),
            ]),
        );
    });
});
