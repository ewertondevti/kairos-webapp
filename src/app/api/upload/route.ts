import { NextRequest } from "next/server";
import { proxyRequest } from "../_utils/proxy";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    // Determine endpoint based on type
    const endpoint = type === "event" ? "/uploadEvent" : "/uploadImage";

    return proxyRequest("POST", endpoint, {
      file: body.file,
      fileName: body.fileName,
      mimeType: body.mimeType,
    });
  } catch (error: any) {
    return proxyRequest("POST", "/uploadImage", {}); // Will return error
  }
}
