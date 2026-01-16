import axios, { AxiosError } from "axios";
import FormData from "form-data";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const serverApi = axios.create({
  baseURL: `https://us-central1-${projectId}.cloudfunctions.net`,
  timeout: 60000 * 5,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const fileName = formData.get("fileName")?.toString();
    const mimeType = formData.get("mimeType")?.toString();
    const type = formData.get("type")?.toString() ?? "image";
    const authorization = request.headers.get("authorization") || "";

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const outbound = new FormData();
    outbound.append("file", buffer, {
      filename: fileName || file.name,
      contentType: mimeType || file.type,
    });
    outbound.append("fileName", fileName || file.name);
    outbound.append("mimeType", mimeType || file.type);

    const endpoint = type === "event" ? "/uploadEvent" : "/uploadImage";
    const response = await serverApi.post(endpoint, outbound, {
      headers: {
        ...outbound.getHeaders(),
        authorization,
      },
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status || 500;
    const errorData = axiosError.response?.data || { error: axiosError.message };
    return NextResponse.json(errorData, { status });
  }
}
