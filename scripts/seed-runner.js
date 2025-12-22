// scripts/seed-runner.js
import { spawn } from "child_process";

spawn("tsx", ["config/preInstallation/preInst.ts"], {
  stdio: "inherit",
  env: {
    ...process.env,
    MONGODB_URI:
      "mongodb+srv://feedo:feedo_123@feedo.tgsvg93.mongodb.net/feedo",
  },
  shell: true,
});
