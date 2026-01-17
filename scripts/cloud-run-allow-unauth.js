const { execFileSync } = require("node:child_process");

const projectId =
  process.env.GCP_PROJECT_ID || process.env.NEXT_PUBLIC_PROJECT_ID;
const region = process.env.CLOUD_RUN_REGION;
const serviceName = process.env.CLOUD_RUN_SERVICE;

if (!projectId || !region || !serviceName) {
  console.error(
    "Missing env vars. Set GCP_PROJECT_ID (or NEXT_PUBLIC_PROJECT_ID), CLOUD_RUN_REGION, CLOUD_RUN_SERVICE."
  );
  process.exit(1);
}

try {
  execFileSync("gcloud", ["--version"], { stdio: "ignore" });
} catch (error) {
  console.error("gcloud CLI not found in PATH.");
  process.exit(1);
}

execFileSync(
  "gcloud",
  [
    "run",
    "services",
    "add-iam-policy-binding",
    serviceName,
    "--region",
    region,
    "--project",
    projectId,
    "--member=allUsers",
    "--role=roles/run.invoker",
  ],
  { stdio: "inherit" }
);

execFileSync(
  "gcloud",
  [
    "run",
    "services",
    "get-iam-policy",
    serviceName,
    "--region",
    region,
    "--project",
    projectId,
  ],
  { stdio: "inherit" }
);
