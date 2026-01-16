import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {Readable} from "stream";
import busboy = require("busboy");
import {storage} from "../firebaseAdmin";
import {buildStorageFileName} from "./common";
import {processHeicToJpeg} from "../utils";

type UploadResult = {
  url: string;
  fileName: string;
  storagePath: string;
};

type UploadOptions = {
  maxFileSizeBytes: number;
  cacheControl: string;
  urlExpiresMs: number;
};

type UploadError = Error & { statusCode?: number };

const createUploadError = (message: string, statusCode: number) => {
  const error = new Error(message) as UploadError;
  error.statusCode = statusCode;
  return error;
};

export const handleMultipartUpload = async (
  request: any,
  basePath: string,
  options: UploadOptions
): Promise<UploadResult> => {
  let tempFilePath: string | null = null;
  let convertedFilePath: string | null = null;

  try {
    const result = await new Promise<UploadResult>((resolve, reject) => {
      const busboyParser = busboy({
        headers: request.headers,
        limits: {files: 1, fileSize: options.maxFileSizeBytes},
      });

      let fileHandled = false;
      let uploadPromise: Promise<UploadResult> | null = null;

      busboyParser.on(
        "file",
        (
          fieldName: string,
          fileStream: Readable & { truncated?: boolean },
          info: busboy.FileInfo
        ) => {
          if (fileHandled) {
            fileStream.resume();
            return;
          }

          fileHandled = true;
          const originalName = info.filename || "arquivo";
          const safeName = path.basename(originalName);
          const mimeType = info.mimeType || "application/octet-stream";
          const extension = path.extname(safeName).toLowerCase();
          const isHeic =
            mimeType.toLowerCase() === "image/heic" || extension === ".heic";

          if (!mimeType.startsWith("image/")) {
            fileStream.resume();
            reject(createUploadError("Tipo de arquivo inválido.", 415));
            return;
          }

          const finalFileName = buildStorageFileName(
            safeName,
            isHeic ? ".jpeg" : undefined
          );
          const destination = `${basePath}/${finalFileName}`;
          const contentType = isHeic ? "image/jpeg" : mimeType;

          fileStream.on("limit", () => {
            reject(
              createUploadError("Arquivo excede o limite permitido.", 413)
            );
          });

          if (isHeic) {
            tempFilePath = path.join(os.tmpdir(), finalFileName);
            const tempWriteStream = fs.createWriteStream(tempFilePath);
            fileStream.pipe(tempWriteStream);

            uploadPromise = new Promise<UploadResult>(
              (resolveUpload, rejectUpload) => {
                tempWriteStream.on("finish", async () => {
                  try {
                    const targetPath = path.join(
                      os.tmpdir(),
                      `${path.parse(finalFileName).name}.jpeg`
                    );
                    convertedFilePath = await processHeicToJpeg(
                    tempFilePath!,
                    targetPath
                    );

                    await storage.bucket().upload(convertedFilePath, {
                      destination,
                      metadata: {
                        contentType,
                        cacheControl: options.cacheControl,
                      },
                    });

                    const [url] = await storage
                      .bucket()
                      .file(destination)
                      .getSignedUrl({
                        action: "read",
                        expires: Date.now() + options.urlExpiresMs,
                      });

                    resolveUpload({
                      url,
                      fileName: finalFileName,
                      storagePath: destination,
                    });
                  } catch (error) {
                    rejectUpload(error);
                  }
                });

                tempWriteStream.on("error", rejectUpload);
                fileStream.on("error", rejectUpload);
              }
            );
          } else {
            const storageFile = storage.bucket().file(destination);
            const writeStream = storageFile.createWriteStream({
              metadata: {
                contentType,
                cacheControl: options.cacheControl,
              },
            });

            uploadPromise = new Promise<UploadResult>(
              (resolveUpload, rejectUpload) => {
                writeStream.on("finish", async () => {
                  try {
                    const [url] = await storageFile.getSignedUrl({
                      action: "read",
                      expires: Date.now() + options.urlExpiresMs,
                    });
                    resolveUpload({
                      url,
                      fileName: finalFileName,
                      storagePath: destination,
                    });
                  } catch (error) {
                    rejectUpload(error);
                  }
                });

                writeStream.on("error", rejectUpload);
                fileStream.on("error", rejectUpload);
              }
            );

            fileStream.pipe(writeStream);
          }
        }
      );

      busboyParser.on("finish", async () => {
        if (!fileHandled) {
          reject(createUploadError("Arquivo não enviado.", 400));
          return;
        }

        if (!uploadPromise) {
          reject(createUploadError("Falha ao processar upload.", 500));
          return;
        }

        try {
          resolve(await uploadPromise);
        } catch (error) {
          reject(error);
        }
      });

      busboyParser.on("error", (error: unknown) => {
        reject(error);
      });

      request.pipe(busboyParser);
    });

    return result;
  } finally {
    [tempFilePath, convertedFilePath]
      .filter(Boolean)
      .forEach((filePath) => {
        try {
          if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (cleanupError) {
          console.error(
            `Erro ao limpar arquivo temporário ${filePath}:`,
            cleanupError
          );
        }
      });
  }
};
