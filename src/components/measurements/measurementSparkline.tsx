
type measurementSparklineProps = {
    values: number[],
    label: string,
}

const CHART_WIDTH = 100;
const CHART_HEIGHT = 32;
const CHART_PADDING = 2;

export default function MeasurementSparkline({values, label}: measurementSparklineProps) {
    if (values.length < 3) return null;

    const minimumValue = Math.min(...values);
    const maximumValue = Math.max(...values);
    const valueRange = maximumValue - minimumValue;

    const usableWidth = CHART_WIDTH - CHART_PADDING * 2;
    const usableHeight = CHART_HEIGHT - CHART_PADDING * 2;

    const points = values.map((value, index) => {
        const x = CHART_PADDING + (index / (values.length - 1)) * usableWidth
        const y = valueRange === 0 ? CHART_HEIGHT / 2 : CHART_PADDING + ((maximumValue - value) / valueRange) * usableHeight;

        return `${x},${y}`;
    })
        .join(" ");

    return (
        <svg
            role="img"
            aria-label={`${label} progress`}
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            preserveAspectRatio="none"
            className="mt-2 h-10 w-full text-secondary"
        >
            <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    )
}
