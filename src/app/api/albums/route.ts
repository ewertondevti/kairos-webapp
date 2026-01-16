import { NextRequest } from "next/server";
import { proxyRequest } from "@/app/api/_utils/proxy";

export async function GET() {
  return proxyRequest("GET", "/getAlbums");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authorization = request.headers.get("authorization") || "";
    
    if (body.id) {
      // Update album
      return proxyRequest("POST", "/updateAlbum", body, undefined, {
        authorization,
      });
    } else {
      // Create album
      return proxyRequest("POST", "/createAlbum", body, undefined, {
        authorization,
      });
    }
  } catch (error: any) {
    return proxyRequest("POST", "/createAlbum", {}); // Will return error from proxyRequest
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const authorization = request.headers.get("authorization") || "";
  
  if (!id) {
    return proxyRequest("DELETE", "/deleteAlbum", undefined, { id: "" }); // Will return error from proxy
  }
  
  return proxyRequest("DELETE", "/deleteAlbum", undefined, { id }, {
    authorization,
  });
}
