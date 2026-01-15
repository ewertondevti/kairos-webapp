import { NextRequest } from "next/server";
import { proxyRequest } from "../_utils/proxy";

export async function GET() {
  return proxyRequest("GET", "/getAlbums");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.id) {
      // Update album
      return proxyRequest("POST", "/updateAlbum", body);
    } else {
      // Create album
      return proxyRequest("POST", "/createAlbum", body);
    }
  } catch (error: any) {
    return proxyRequest("POST", "/createAlbum", {}); // Will return error from proxyRequest
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  
  if (!id) {
    return proxyRequest("DELETE", "/deleteAlbum", undefined, { id: "" }); // Will return error from proxy
  }
  
  return proxyRequest("DELETE", "/deleteAlbum", undefined, { id });
}
