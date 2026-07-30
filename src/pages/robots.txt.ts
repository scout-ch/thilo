import type { APIRoute } from 'astro';
import { absoluteUrl } from '../utils/urls';

export const GET: APIRoute = () => {
  return new Response(
    `# https://www.robotstxt.org/robotstxt.html\nUser-agent: *\nDisallow:\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};
