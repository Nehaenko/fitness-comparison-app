import type {MetadataRoute} from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        id: "/",
        name: "Forma — Private fitness companion",
        short_name: "Forma",
        description: "Plan workouts, track progress, and compare your results.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#09100c",
        theme_color: "#09100c",
        categories: ["fitness", "health", "lifestyle"],
        icons: [
            {
                src: "/icons/forma-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/forma-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/forma-maskable-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
