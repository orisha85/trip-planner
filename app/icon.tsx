import { ImageResponse } from "next/og";
import { LOGO_DATA_URL } from "@/lib/logo";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    // eslint-disable-next-line @next/next/no-img-element
    <img src={LOGO_DATA_URL} alt="" style={{ width: "100%", height: "100%" }} />,
    { ...size },
  );
}
