import { getUploadAuthParams } from "@imagekit/next/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const publicKey = process.env.NEXT_PUBLIC_IK_PUBLIC_KEY;
    const privateKey = process.env.NEXT_PUBLIC_IK_PRIVATE_KEY;
    const urlEndpoint = process.env.NEXT_PUBLIC_IK_URL_ENDPOINT;

    if (!publicKey || !privateKey) {
      console.error("Missing ImageKit keys:", {
        publicKey: !!publicKey,
        privateKey: !!privateKey,
      });
      return NextResponse.json(
        { error: "ImageKit keys are not configured" },
        { status: 500 },
      );
    }

    const authParams = getUploadAuthParams({
      publicKey,
      privateKey,
    });

    return NextResponse.json(authParams);
  } catch (error: any) {
    console.error("ImageKit Auth Error:", error);
    return NextResponse.json(
      { error: "Failed to generate auth params", details: error.message },
      { status: 500 },
    );
  }
}
