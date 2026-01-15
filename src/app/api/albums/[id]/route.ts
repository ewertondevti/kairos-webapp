import { NextRequest } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  if (!id) {
    return proxyRequest("GET", "/getAlbumById", undefined, { id: "" }); // Will return error from proxy
  }

  return proxyRequest("GET", "/getAlbumById", undefined, { id });
}
