import { markdownByRoute, markdownResponse } from '@/lib/ai/markdown';
import { env } from '@/lib/env/server';

export const dynamic = 'force-static';

export function GET() {
  return markdownResponse(markdownByRoute.reservations(env.siteUrl));
}
