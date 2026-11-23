import { creditUrl, images } from '@/content/images';
import { allergenLabels, dietaryLabels, menuCategories, menuMeta } from '@/content/menu';
import { openingHours, site } from '@/content/site';
import { routes, type RouteKey } from '@/content/seo';
import { faq } from '@/content/pages';
import { groupedMenu } from '@/lib/menu';
import { unsplashSrc } from '@/lib/images/loader';
import type { DietaryTag } from '@/types/content';

const dayNames: Record<string, string> = {
  Monday: 'https://schema.org/Monday',
  Tuesday: 'https://schema.org/Tuesday',
  Wednesday: 'https://schema.org/Wednesday',
  Thursday: 'https://schema.org/Thursday',
  Friday: 'https://schema.org/Friday',
  Saturday: 'https://schema.org/Saturday',
  Sunday: 'https://schema.org/Sunday',
};

/** Only diets schema.org defines (no DairyFree enumeration exists). */
const schemaDiet: Partial<Record<DietaryTag, string>> = {
  vegetarian: 'https://schema.org/VegetarianDiet',
  vegan: 'https://schema.org/VeganDiet',
  'gluten-free': 'https://schema.org/GlutenFreeDiet',
};

export const restaurantId = (siteUrl: string) => `${siteUrl}/#restaurant`;

/**
 * Restaurant entity. Address and telephone are deliberately omitted until real
 * values exist — structured data must never contain invented business facts.
 */
export function restaurantJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': restaurantId(siteUrl),
    name: site.name,
    description: site.description,
    url: siteUrl,
    image: [unsplashSrc(images.heroDiningRoom.id)],
    servesCuisine: site.cuisine,
    priceRange: site.priceRange,
    currenciesAccepted: site.currency,
    acceptsReservations: `${siteUrl}${routes.reservations.path}`,
    hasMenu: `${siteUrl}${routes.menu.path}`,
    email: site.contact.email,
    founder: { '@type': 'Person', name: site.chef.name, jobTitle: site.chef.role },
    openingHoursSpecification: openingHours.flatMap(({ day, periods }) =>
      periods.map((p) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: dayNames[day],
        opens: p.opens,
        closes: p.closes,
      })),
    ),
    ...(site.demo ? { disambiguatingDescription: site.demoNotice } : {}),
  };
}

export function websiteJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: site.name,
    url: siteUrl,
    inLanguage: site.locale,
    publisher: { '@id': restaurantId(siteUrl) },
  };
}

export function breadcrumbJsonLd(siteUrl: string, key: Exclude<RouteKey, 'home'>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: routes[key].shortTitle,
        item: `${siteUrl}${routes[key].path}`,
      },
    ],
  };
}

export function menuJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    '@id': `${siteUrl}/menu#menu`,
    name: `${site.name} menu — ${menuMeta.season}`,
    inLanguage: site.locale,
    url: `${siteUrl}/menu`,
    hasMenuSection: groupedMenu('all').map(({ category, items }) => ({
      '@type': 'MenuSection',
      name: category.title,
      description: category.intro,
      hasMenuItem: items.map((item) => {
        const diets = item.dietary.map((d) => schemaDiet[d]).filter(Boolean);
        return {
          '@type': 'MenuItem',
          name: item.name,
          description: item.description,
          offers: { '@type': 'Offer', price: item.price.toFixed(2), priceCurrency: site.currency },
          ...(diets.length ? { suitableForDiet: diets } : {}),
          ...(item.image && item.image in images
            ? { image: unsplashSrc(images[item.image as keyof typeof images].id) }
            : {}),
        };
      }),
    })),
  };
}

export function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/** Machine-readable menu served at /menu.json. */
export function menuDocument(siteUrl: string) {
  return {
    restaurant: site.name,
    demo: site.demo,
    notice: site.demo ? site.demoNotice : undefined,
    season: menuMeta.season,
    updated: menuMeta.updated,
    currency: site.currency,
    url: `${siteUrl}/menu`,
    dietaryLabels,
    allergens: allergenLabels,
    categories: menuCategories.map((category) => ({
      ...category,
      items: groupedMenu(category.id).flatMap((g) =>
        g.items.map(({ image, featured: _featured, ...item }) => ({
          ...item,
          image:
            image && image in images
              ? {
                  url: unsplashSrc(images[image as keyof typeof images].id),
                  credit: creditUrl(images[image as keyof typeof images]),
                }
              : undefined,
        })),
      ),
    })),
  };
}
