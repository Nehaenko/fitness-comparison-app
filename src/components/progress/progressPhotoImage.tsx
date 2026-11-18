"use client";

import Image from "next/image";
import {useState, type CSSProperties} from "react";

const loadedPhotoUrls = new Set<string>();

type ProgressPhotoImageProps = {
    src: string;
    alt: string;
    sizes: string;
    className?: string;
    style?: CSSProperties;
};

export default function ProgressPhotoImage({
                                               src,
                                               alt,
                                               sizes,
                                               className = "",
                                               style,
                                           }: ProgressPhotoImageProps) {
    const [loadedSrc, setLoadedSrc] = useState<string | null>(() =>
        loadedPhotoUrls.has(src) ? src : null,
    );
    const [failedSrc, setFailedSrc] = useState<string | null>(null);

    const hasLoaded = (
        loadedSrc === src || loadedPhotoUrls.has(src)
    ) && failedSrc !== src;
    const hasFailed = failedSrc === src;

    return (
        <>
            {!hasLoaded && !hasFailed ? (
                <div
                    role="status"
                    aria-label="Loading photo"
                    className="absolute inset-0 z-10 grid animate-pulse place-items-center bg-surface-muted"
                >
                    <span className="size-7 animate-spin rounded-full border-2 border-primary/25 border-t-primary"/>
                    <span className="sr-only">Loading photo</span>
                </div>
            ) : null}

            {hasFailed ? (
                <div
                    role="alert"
                    className="absolute inset-0 z-10 flex items-center justify-center bg-surface-subtle px-4 text-center text-small text-secondary"
                >
                    Photo could not be loaded
                </div>
            ) : null}

            <Image
                src={src}
                alt={alt}
                fill
                unoptimized
                draggable={false}
                sizes={sizes}
                onLoad={() => {
                    loadedPhotoUrls.add(src);
                    setFailedSrc(null);
                    setLoadedSrc(src);
                }}
                onError={() => setFailedSrc(src)}
                style={style}
                className={`transition-opacity duration-300 ${
                    hasLoaded ? "opacity-100" : "opacity-0"
                } ${className}`}
            />
        </>
    );
}
