import { json } from "@/lib/api-response";

export async function GET() {
  return json({
    manualPassRate: 0,
    automationPassRate: 0,
    testCoverage: 0,
    automationMappingCoverage: 0,
    flakyRate: 0,
    message: "No data yet. Run tests to see metrics.",
  });
}
