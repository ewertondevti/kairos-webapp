import { NextRequest } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authorization = request.headers.get("authorization") || "";
    return proxyRequest("POST", "/deleteImageFromAlbum", body, undefined, {
      authorization,
    });
  } catch (error: any) {
    return proxyRequest("POST", "/deleteImageFromAlbum", {}); // Will return error
  }
}
