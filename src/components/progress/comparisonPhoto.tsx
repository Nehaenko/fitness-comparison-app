"use client";

import {useState, useRef, type PointerEvent as ReactPointerEvent,} from "react";
import ProgressPhotoImage from "@/components/progress/progressPhotoImage";
import type {
    ProgressPhotoRecord,
    ProgressPhotoView,
} from "@/types/progress";
import {formatProgressDate} from "@/validation/progress";
import {getPointerDistance, type PointerPosition} from "@/helpers/drag-drop-helpers";

type ComparisonPhotoProps = {
    photo: ProgressPhotoRecord | undefined;
    recordedOn: string | undefined;
    selectedView: ProgressPhotoView;
    side: "before" | "after";
};

const MIN_SCALE = 1;
const MAX_SCALE = 3;

export default function ComparisonPhoto({
                                            photo,
                                            recordedOn,
                                            selectedView,
                                            side,
                                        }: ComparisonPhotoProps) {
    const isBefore = side === "before";
    const sideLabel = isBefore ? "Before" : "After";
    const formattedDate = recordedOn
        ? formatProgressDate(recordedOn)
        : sideLabel;

    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState<PointerPosition>({
        x: 0,
        y: 0,
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const zoomRef = useRef(MIN_SCALE);
    const activePointersRef = useRef(
        new Map<number, PointerPosition>(),
    );
    const previousPinchDistanceRef = useRef<number | null>(null);
    const lastDragPointRef = useRef<PointerPosition | null>(null);

    const clampPosition = (
        nextPosition: PointerPosition,
        currentZoom: number,
    ): PointerPosition => {
        const container = containerRef.current;

        if (!container || currentZoom <= MIN_SCALE) {
            return {x: 0, y: 0};
        }

        const maxX = (container.clientWidth * (currentZoom - 1)) / 2;
        const maxY = (container.clientHeight * (currentZoom - 1)) / 2;

        return {
            x: Math.max(-maxX, Math.min(maxX, nextPosition.x)),
            y: Math.max(-maxY, Math.min(maxY, nextPosition.y)),
        };
    };

    const updateZoom = (nextZoom: number) => {
        const clampedZoom = Math.min(
            MAX_SCALE,
            Math.max(MIN_SCALE, nextZoom),
        );

        zoomRef.current = clampedZoom;
        setZoom(clampedZoom);
        setPosition((currentPosition) =>
            clampPosition(currentPosition, clampedZoom),
        );
    };

    const resetTransform = () => {
        zoomRef.current = MIN_SCALE;
        setZoom(MIN_SCALE);
        setPosition({x: 0, y: 0});
        previousPinchDistanceRef.current = null;
        lastDragPointRef.current = null;
    };

    const handlePointerDown = (
        event: ReactPointerEvent<HTMLDivElement>,
    ) => {
        event.currentTarget.setPointerCapture(event.pointerId);

        const pointerPosition = {
            x: event.clientX,
            y: event.clientY,
        };

        activePointersRef.current.set(
            event.pointerId,
            pointerPosition,
        );

        const pointers = Array.from(
            activePointersRef.current.values(),
        );

        if (pointers.length === 2) {
            lastDragPointRef.current = null;
            previousPinchDistanceRef.current =
                getPointerDistance(pointers[0], pointers[1]);
        } else if (
            pointers.length === 1 &&
            zoomRef.current > MIN_SCALE
        ) {
            lastDragPointRef.current = pointerPosition;
        }
    };

    const handlePointerMove = (
        event: ReactPointerEvent<HTMLDivElement>,
    ) => {
        if (!activePointersRef.current.has(event.pointerId)) {
            return;
        }

        const pointerPosition = {
            x: event.clientX,
            y: event.clientY,
        };

        activePointersRef.current.set(
            event.pointerId,
            pointerPosition,
        );

        const pointers = Array.from(
            activePointersRef.current.values(),
        );

        if (pointers.length === 1) {
            const previousPoint = lastDragPointRef.current;

            if (
                previousPoint !== null &&
                zoomRef.current > MIN_SCALE
            ) {
                const movement = {
                    x: pointerPosition.x - previousPoint.x,
                    y: pointerPosition.y - previousPoint.y,
                };

                setPosition((currentPosition) =>
                    clampPosition(
                        {
                            x: currentPosition.x + movement.x,
                            y: currentPosition.y + movement.y,
                        },
                        zoomRef.current,
                    ),
                );
            }

            lastDragPointRef.current = pointerPosition;
            return;
        }

        if (pointers.length !== 2) {
            return;
        }

        const currentDistance = getPointerDistance(
            pointers[0],
            pointers[1],
        );

        const previousDistance =
            previousPinchDistanceRef.current;

        if (previousDistance !== null && previousDistance > 0) {
            const distanceChange =
                currentDistance / previousDistance;

            updateZoom(
                zoomRef.current * distanceChange,
            );
        }

        previousPinchDistanceRef.current = currentDistance;
    };

    const handlePointerEnd = (
        event: ReactPointerEvent<HTMLDivElement>,
    ) => {
        activePointersRef.current.delete(event.pointerId);

        if (activePointersRef.current.size < 2) {
            previousPinchDistanceRef.current = null;
        }

        const remainingPointers = Array.from(
            activePointersRef.current.values(),
        );

        lastDragPointRef.current =
            remainingPointers.length === 1 &&
            zoomRef.current > MIN_SCALE
                ? remainingPointers[0]
                : null;

        if (
            event.currentTarget.hasPointerCapture(event.pointerId)
        ) {
            event.currentTarget.releasePointerCapture(
                event.pointerId,
            );
        }
    };

    return (
        <div ref={containerRef}
             onPointerDown={handlePointerDown}
             onPointerMove={handlePointerMove}
             onPointerUp={handlePointerEnd}
             onPointerCancel={handlePointerEnd}
             onDoubleClick={resetTransform}
             style={{
                 touchAction: zoom > MIN_SCALE ? "none" : "pan-y",
             }}
             className={`relative flex items-center justify-center overflow-hidden text-secondary ${
                 isBefore
                     ? "border-r border-divider bg-surface-subtle"
                     : "bg-surface"
             } ${photo && zoom > MIN_SCALE ? "cursor-grab" : ""}`}
        >
            {photo ? (
                <ProgressPhotoImage
                    src={photo.imageUrl}
                    alt={`${selectedView} progress photo from ${formattedDate}`}
                    style={{
                        transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${zoom})`,
                    }}
                    sizes="(max-width: 640px) 50vw, 24rem"
                    className="pointer-events-none select-none object-cover will-change-transform"
                />
            ) : (
                <p
                    className={`mx-4 rounded-control border border-dashed border-border px-4 py-3 text-center text-small font-medium capitalize text-secondary ${
                        isBefore ? "bg-surface" : "bg-surface-subtle"
                    }`}
                >
                    No {selectedView} photo
                </p>
            )}

            <span
                className={`absolute bottom-4 z-10 rounded-pill bg-surface-inverse/80 px-3 py-1 text-label text-inverse ${
                    isBefore ? "left-4" : "right-4"
                }`}
            >
                {formattedDate}
            </span>
        </div>
    );
}
