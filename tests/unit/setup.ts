import { config } from "dotenv";
import path from "path";

// Load test environment variables from .env.local
config({ path: path.resolve(__dirname, "../../.env.local") });
