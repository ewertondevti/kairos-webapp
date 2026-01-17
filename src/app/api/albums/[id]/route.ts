import { NextRequest } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = request.nextUrl;
  const limit = searchParams.get("limit") || undefined;
  const cursor = searchParams.get("cursor") || undefined;
  const authorization = request.headers.get("authorization") || "";
  
  if (!id) {
    return proxyRequest("GET", "/getAlbumById", undefined, { id: "" }); // Will return error from proxy
  }

  return proxyRequest("GET", "/getAlbumById", undefined, {
    id,
    limit: limit ?? "",
    cursor: cursor ?? "",
  }, {
    authorization,
  });
}
