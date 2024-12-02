import * as cors from "cors";
import * as fs from "fs";
import * as heicConvert from "heic-convert";

export const corsHandler = cors({
  origin: ["http://localhost:3000", "https://kairos-portugal.com"],
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
});

export const processHeicToJpeg = async (
  inputPath: string,
  outputPath: string
) => {
  try {
    const inputBuffer = fs.readFileSync(inputPath);

    // Converte o buffer HEIC para JPEG usando heic-convert
    const outputBuffer = await heicConvert({
      buffer: inputBuffer as Uint8Array, // Buffer de entrada
      format: "JPEG", // Formato de saída
      quality: 1, // Qualidade máxima (1 = melhor qualidade)
    });

    // Salva o buffer JPEG no caminho de saída
    fs.writeFileSync(outputPath, Buffer.from(outputBuffer));

    console.log("Conversão concluída:", outputPath);
    return outputPath;
  } catch (error) {
    console.error("Erro ao converter HEIC para JPEG:", error);
    throw new Error("Erro na conversão de HEIC para JPEG.");
  }
};
