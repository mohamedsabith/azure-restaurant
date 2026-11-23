import { env } from '@/lib/env/server';
import { menuDocument } from '@/lib/seo/jsonld';

export const dynamic = 'force-static';

export function GET() {
  return Response.json(menuDocument(env.siteUrl), {
    headers: { 'X-Robots-Tag': 'noindex', 'Access-Control-Allow-Origin': '*' },
  });
}
