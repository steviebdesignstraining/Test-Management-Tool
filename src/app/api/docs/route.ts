export const dynamic = "force-static";
import { openApiSpec } from "./spec";
import { readFileSync } from "fs";
import { join } from "path";

const OPENAPI_JSON_PATH = join(process.cwd(), "src/app/api/docs/openapi.json");

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format");

  if (format === "json") {
    try {
      const spec = JSON.parse(readFileSync(OPENAPI_JSON_PATH, "utf-8"));
      return new Response(JSON.stringify(spec, null, 2), {
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify(openApiSpec), {
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TestFlow API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>body { margin: 0; padding: 0; }</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        dom_id: '#swagger-ui',
        spec: ${JSON.stringify(openApiSpec)},
        presets: [SwaggerUIBundle.presets.apis],
        layout: 'StandaloneLayout',
      });
    };
  </script>
</body>
</html>
  `;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
