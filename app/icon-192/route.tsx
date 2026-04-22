import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fbf8f2",
        borderRadius: 38,
        fontSize: 130,
        fontStyle: "italic",
        color: "#d85a1c",
      }}
    >
      ƒ
    </div>,
    { width: 192, height: 192 },
  );
}
