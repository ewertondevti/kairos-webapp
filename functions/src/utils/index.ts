import * as cors from "cors";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as sharp from "sharp";

export const corsHandler = cors({
  origin: ["https://localhost:3000", "https://kairos-portugal.com"],
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
});

export const processHeicToJpeg = async (
  filePath: string,
  outputFileName: string
) => {
  try {
    const tempDir = os.tmpdir();
    const outputFilePath = path.join(os.tmpdir(), outputFileName);

    // Verifica se o diretório temporário existe
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Use Sharp para converter HEIC para JPEG
    await sharp(filePath)
      .toFormat("jpeg")
      .jpeg({ quality: 80 })
      .toFile(outputFilePath);

    return outputFilePath;
  } catch (error) {
    console.error("Erro ao converter HEIC para JPEG:", error);
    throw new Error("Erro na conversão de HEIC para JPEG.");
  }
};
