"use client";

import Image from "next/image";
import {useState, type CSSProperties} from "react";

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
    const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
    const [failedSrc, setFailedSrc] = useState<string | null>(null);

    const hasLoaded = loadedSrc === src && failedSrc !== src;
    const hasFailed = failedSrc === src;

    return (
        <>
            {!hasLoaded && !hasFailed ? (
                <div
                    role="status"
                    className="absolute inset-0 z-10 flex animate-pulse items-center justify-center bg-surface-muted text-small text-secondary"
                >
                    <span className="rounded-pill bg-surface/85 px-3 py-1.5">
                        Loading photo…
                    </span>
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
