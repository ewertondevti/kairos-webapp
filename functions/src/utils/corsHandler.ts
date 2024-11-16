import * as cors from "cors";

export const corsHandler = cors({
  origin: ["https://localhost:3000", "https://kairos-portugal.com"],
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
});
