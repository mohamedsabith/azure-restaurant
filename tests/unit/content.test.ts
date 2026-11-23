import { describe, expect, it } from 'vitest';
import { images } from '@/content/images';
import { menuCategories, menuItems } from '@/content/menu';
import { home, story } from '@/content/pages';
import { site } from '@/content/site';
import { filterMenu, groupedMenu, isImageKey } from '@/lib/menu';

describe('content integrity', () => {
  it('references only images that exist in the manifest', () => {
    for (const item of menuItems) if (item.image) expect(isImageKey(item.image), item.id).toBe(true);
    for (const g of [...home.gallery, ...story.gallery.items]) expect(g.image in images).toBe(true);
  });

  it('records a verified Unsplash source and credit for every photograph', () => {
    for (const [key, asset] of Object.entries(images)) {
      expect(asset.id, key).toMatch(/^photo-\d{10,}-[0-9a-f]{12}$/);
      expect(asset.page, key).toMatch(/^https:\/\/unsplash\.com\/photos\//);
      expect(asset.credit.name.length, key).toBeGreaterThan(0);
      expect(asset.alt.length, key).toBeGreaterThan(10);
    }
  });

  it('does not reuse a photograph across galleries or between home and story sections', () => {
    const galleries = [...home.gallery, ...story.gallery.items].map((g) => g.image);
    expect(new Set(galleries).size).toBe(galleries.length);
  });

  it('keeps menu ids unique and every category populated', () => {
    expect(new Set(menuItems.map((i) => i.id)).size).toBe(menuItems.length);
    for (const c of menuCategories)
      expect(
        menuItems.some((i) => i.category === c.id),
        c.id,
      ).toBe(true);
  });

  it('labels vegan dishes as vegetarian too', () => {
    for (const item of menuItems.filter((i) => i.dietary.includes('vegan'))) {
      expect(item.dietary, item.id).toContain('vegetarian');
    }
  });

  it('keeps placeholder business data as placeholders', () => {
    expect(site.contact.address).toBeNull();
    expect(site.contact.phone).toBeNull();
    expect(site.contact.email.endsWith('.example')).toBe(true);
  });
});

describe('menu filtering', () => {
  it('filters by category and requires every selected diet', () => {
    const desserts = filterMenu(menuItems, 'desserts');
    expect(desserts.every((i) => i.category === 'desserts')).toBe(true);
    const veganGf = filterMenu(menuItems, 'all', ['vegan', 'gluten-free']);
    expect(veganGf.length).toBeGreaterThan(0);
    expect(veganGf.every((i) => i.dietary.includes('vegan') && i.dietary.includes('gluten-free'))).toBe(true);
  });

  it('omits empty sections from grouped output', () => {
    const groups = groupedMenu('all', ['vegan']);
    expect(groups.every((g) => g.items.length > 0)).toBe(true);
    expect(groups.some((g) => g.category.id === 'chefs-selection')).toBe(false);
  });
});
