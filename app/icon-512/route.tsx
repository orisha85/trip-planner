import { ImageResponse } from "next/og";
import { LOGO_DATA_URL } from "@/lib/logo";

export function GET() {
  return new ImageResponse(
    // eslint-disable-next-line @next/next/no-img-element
    <img src={LOGO_DATA_URL} alt="" style={{ width: "100%", height: "100%" }} />,
    { width: 512, height: 512 },
  );
}
