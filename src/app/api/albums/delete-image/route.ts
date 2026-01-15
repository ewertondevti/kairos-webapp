import { NextRequest } from "next/server";
import { proxyRequest } from "../_utils/proxy";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return proxyRequest("POST", "/deleteImageFromAlbum", body);
  } catch (error: any) {
    return proxyRequest("POST", "/deleteImageFromAlbum", {}); // Will return error
  }
}
