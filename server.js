import http from "node:http";
import { metadata, robots, sitemap } from "./scripts/metadata.js";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { services } from "./site.config.js";
import { renderSite } from "./scripts/render-site.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const serviceNames = new Set([
  ...services.map((service) => service.title),
  "Not sure yet",
  "Roof Residential",
  "Commercial Roofing",
]);
const allowedFiles = new Set([
  "index.html",
  "styles.css",
  "script.js",
  "site.config.js",
  "translations.js",
  "robots.txt",
]);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
};

export function validateEstimate(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const lead = {};
  for (const [key, max] of Object.entries({
    name: 100,
    phone: 25,
    email: 254,
    city: 100,
    service: 60,
    message: 3000,
  })) {
    if (
      typeof data[key] !== "string" &&
      !(key === "message" && data[key] == null)
    )
      return null;
    lead[key] = (data[key] || "").trim();
    if (
      lead[key].length > max ||
      (key !== "message" && !lead[key]) ||
      /\u0000/.test(lead[key])
    )
      return null;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return null;
  if (
    !/^[+()\d .-]{7,25}$/.test(lead.phone) ||
    lead.phone.replace(/\D/g, "").length < 7
  )
    return null;
  if (!serviceNames.has(lead.service) || !["on", true].includes(data.consent))
    return null;
  if (data.website) return null;
  return {
    ...lead,
    consent: true,
    source: "website-estimate",
    submittedAt: new Date().toISOString(),
  };
}

export function createApp({
  webhookUrl = process.env.LEAD_WEBHOOK_URL || "",
  webhookToken = process.env.LEAD_WEBHOOK_TOKEN || "",
  publicOrigin = process.env.PUBLIC_ORIGIN || "",
  fetchImpl = fetch,
  staticRoot = root,
  rateLimit = 8,
} = {}) {
  const rateBuckets = new Map();
  const estimatesEnabled = /^https:\/\//.test(webhookUrl);
  const sendJSON = (res, status, data) => {
    res.writeHead(status, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(JSON.stringify(data));
  };
  return http.createServer(async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
    );
    try {
      const requestUrl = new URL(req.url, "http://localhost");
      if (requestUrl.pathname === "/api/config" && req.method === "GET")
        return sendJSON(res, 200, { estimatesEnabled });
      if (requestUrl.pathname === "/api/estimates") {
        if (req.method !== "POST") {
          res.setHeader("Allow", "POST");
          return sendJSON(res, 405, {
            message: "Use POST to submit an estimate.",
          });
        }
        if (
          req.headers.origin &&
          req.headers.origin !== publicOrigin &&
          new URL(req.headers.origin).host !== req.headers.host
        )
          return sendJSON(res, 403, { message: "Origin not allowed." });
        if (!req.headers["content-type"]?.startsWith("application/json"))
          return sendJSON(res, 415, { message: "A JSON request is required." });
        // Socket address only: do not trust a user-supplied forwarded-for header.
        const now = Date.now();
        for (const [key, value] of rateBuckets)
          if (value.until < now) rateBuckets.delete(key);
        const ip = req.socket.remoteAddress || "unknown";
        const bucket = rateBuckets.get(ip) || { count: 0, until: now + 600000 };
        bucket.count++;
        rateBuckets.set(ip, bucket);
        if (bucket.count > rateLimit) {
          res.setHeader("Retry-After", "600");
          return sendJSON(res, 429, {
            message: "Too many requests. Please try again later.",
          });
        }
        if (Number(req.headers["content-length"]) > 10000)
          return sendJSON(res, 413, { message: "Request is too large." });
        const chunks = [];
        let bytes = 0;
        for await (const chunk of req) {
          bytes += chunk.length;
          if (bytes > 10000) {
            sendJSON(res, 413, { message: "Request is too large." });
            return;
          }
          chunks.push(chunk);
        }
        let data;
        try {
          data = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        } catch {
          return sendJSON(res, 400, { message: "Invalid request data." });
        }
        const lead = validateEstimate(data);
        if (!lead)
          return sendJSON(res, 422, {
            message:
              "Check your contact details, service selection, and consent.",
          });
        if (!estimatesEnabled)
          return sendJSON(res, 503, {
            sent: false,
            message:
              "Estimate delivery has not been configured. Your request has not been sent.",
          });
        try {
          const upstream = await fetchImpl(webhookUrl, {
            method: "POST",
            redirect: "error",
            headers: {
              "Content-Type": "application/json",
              ...(webhookToken
                ? { Authorization: `Bearer ${webhookToken}` }
                : {}),
            },
            body: JSON.stringify(lead),
            signal: AbortSignal.timeout(10000),
          });
          if (!upstream.ok) throw new Error("Upstream rejected request");
          await upstream.body?.cancel();
          return sendJSON(res, 200, { sent: true });
        } catch {
          return sendJSON(res, 502, {
            sent: false,
            message:
              "The receiving service did not confirm delivery. Please try again later.",
          });
        }
      }
      if (!["GET", "HEAD"].includes(req.method)) {
        res.setHeader("Allow", "GET, HEAD");
        return sendJSON(res, 405, { message: "Method not allowed." });
      }
      if (requestUrl.pathname === "/sitemap.xml" && publicOrigin) {
        res.writeHead(200, {
          "Content-Type": "application/xml; charset=utf-8",
        });
        return res.end(
          req.method === "HEAD" ? undefined : sitemap(publicOrigin),
        );
      }
      const name =
        decodeURIComponent(requestUrl.pathname).replace(/^\//, "") ||
        "index.html";
      // Explicit public allowlist: this project shares a home directory.
      if (
        !allowedFiles.has(name) &&
        !/^assets\/[a-zA-Z0-9_-]+\.(webp|jpg|jpeg|png|avif|svg|woff2|ttf)$/.test(
          name,
        )
      )
        return sendJSON(res, 404, { message: "Not found." });
      const location = path.join(staticRoot, name);
      if (name === "index.html" || name === "robots.txt") {
        const body =
          name === "index.html"
            ? metadata(renderSite(), publicOrigin)
            : robots(publicOrigin);
        res.writeHead(200, {
          "Content-Type": name === "index.html" ? mime[".html"] : mime[".txt"],
          "Cache-Control": "no-cache",
        });
        return res.end(req.method === "HEAD" ? undefined : body);
      }
      const info = await stat(location);
      res.writeHead(200, {
        "Content-Type": mime[path.extname(name)] || "application/octet-stream",
        "Content-Length": info.size,
        "Cache-Control": name.startsWith("assets/")
          ? "public, max-age=86400"
          : "no-cache",
      });
      res.end(req.method === "HEAD" ? undefined : await readFile(location));
    } catch (error) {
      if (!res.headersSent)
        sendJSON(res, error.code === "ENOENT" ? 404 : 400, {
          message: error.code === "ENOENT" ? "Not found." : "Invalid request.",
        });
      else res.end();
    }
  });
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const port = Number(process.env.PORT || 3000);
  const server = createApp({
    staticRoot: process.env.SERVE_DIST === "1" ? path.join(root, "dist") : root,
  });
  server.requestTimeout = 20000;
  server.headersTimeout = 15000;
  server.listen(port, "0.0.0.0", () =>
    console.log(`Toiture Démo: http://localhost:${port}`),
  );
  for (const signal of ["SIGTERM", "SIGINT"])
    process.on(signal, () => server.close(() => process.exit(0)));
}
