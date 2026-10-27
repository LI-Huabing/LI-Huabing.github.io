import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { pageOf } from "../lib/papers";

export const GET: APIRoute = async ({ site }) => {
  const paths = ["/", ...(await getCollection("papers")).map(pageOf), "/imprint/", "/privacy/"];
  const urls = paths.map((path) => `  <url><loc>${new URL(path, site).href}</loc></url>`);
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
