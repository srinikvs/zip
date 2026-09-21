import { defineConfig, type Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";

function redirectRoot(): Plugin {
  const redirect = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.url === "/" || req.url === "") {
      res.statusCode = 302;
      res.setHeader("Location", "/zip/");
      res.end();
      return;
    }
    next();
  };
  return {
    name: "redirect-root",
    configureServer(server) {
      server.middlewares.use(redirect);
    },
    configurePreviewServer(server) {
      server.middlewares.use(redirect);
    },
  };
}

export default defineConfig({
  base: "/zip/",
  plugins: [redirectRoot()],
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
});
