export function TypeIcon({ type, size = 18 }: { type: string; size?: number }) {
  const props = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };
  if (type === "flight") return (
    <svg {...props}><path d="M2 16l20-7-7 13-3-6-10-0z" /></svg>
  );
  if (type === "train") return (
    <svg {...props}>
      <rect x="5" y="3" width="14" height="14" rx="3" />
      <path d="M5 10h14" />
      <circle cx="9" cy="14" r="1" fill="currentColor" />
      <circle cx="15" cy="14" r="1" fill="currentColor" />
      <path d="M7 17l-2 4M17 17l2 4" />
    </svg>
  );
  if (type === "hotel") return (
    <svg {...props}>
      <path d="M3 20V7h18v13" />
      <path d="M3 13h18" />
      <path d="M7 10h4" />
      <path d="M3 20h18" />
    </svg>
  );
  if (type === "activity") return (
    <svg {...props}>
      <path d="M3 8l9-5 9 5v8l-9 5-9-5z" />
      <path d="M12 3v18" />
      <path d="M3 8l9 5 9-5" />
    </svg>
  );
  return null;
}

export const TYPE_WATERMARK: Record<string, string> = {
  flight: "✈",
  train: "🚆",
  hotel: "🏨",
  activity: "🎟",
};

export const TYPE_LABEL: Record<string, string> = {
  flight: "Flight",
  train: "Train",
  hotel: "Hotel",
  activity: "Activity",
};
