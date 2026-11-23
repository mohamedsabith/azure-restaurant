import { MotionScope } from '@/animations/MotionScope';
import { MenuExplorer } from '@/components/menu/MenuExplorer';
import { JsonLd } from '@/components/seo/JsonLd';
import { menuMeta, tastingMenu } from '@/content/menu';
import { site } from '@/content/site';
import { env } from '@/lib/env/server';
import { breadcrumbJsonLd, menuJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';
import { formatPrice } from '@/lib/utils';
import { DietaryGuide } from '@/sections/menu/DietaryGuide';
import { PageHero } from '@/sections/shared/PageHero';

export const metadata = pageMetadata('menu');

export default function MenuPage() {
  return (
    <>
      <MotionScope>
        <PageHero
          eyebrow={`The ${menuMeta.season.toLowerCase()} menu`}
          title="Written Each"
          accent="Morning."
          intro={menuMeta.intro}
          image="dishLambShank"
          aside={
            <dl className="flex flex-wrap gap-x-10 gap-y-4">
              <div>
                <dt className="eyebrow text-[0.65625rem] text-parchment">Tasting</dt>
                <dd className="mt-1.5 font-display text-[1.9rem] leading-none tabular">
                  {formatPrice(tastingMenu.price, site.currency)}
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-[0.65625rem] text-parchment">Wine pairing</dt>
                <dd className="mt-1.5 font-display text-[1.9rem] leading-none tabular">
                  {formatPrice(tastingMenu.winePairing, site.currency)}
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-[0.65625rem] text-parchment">Zero-proof</dt>
                <dd className="mt-1.5 font-display text-[1.9rem] leading-none tabular">
                  {formatPrice(tastingMenu.zeroProofPairing, site.currency)}
                </dd>
              </div>
            </dl>
          }
        />
      </MotionScope>
      <div className="bg-cream">
        <MenuExplorer />
      </div>
      <MotionScope>
        <DietaryGuide />
      </MotionScope>
      <JsonLd data={menuJsonLd(env.siteUrl)} />
      <JsonLd data={breadcrumbJsonLd(env.siteUrl, 'menu')} />
    </>
  );
}
