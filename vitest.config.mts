import {defineConfig} from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import {fileURLToPath} from "node:url";

export default defineConfig({
    resolve: {
        alias: {
            "server-only": fileURLToPath(
                new URL("./vitest.server-only.ts", import.meta.url),
            ),
        },
    },
    plugins: [
        tsconfigPaths(),
        react(),
    ],
    test: {
        environment: "jsdom",
        setupFiles: ["./vitest.setup.ts"],
        coverage: {
            provider: "v8",
        },
    },
});
