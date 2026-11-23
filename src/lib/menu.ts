import { images, type ImageKey } from '@/content/images';
import { menuCategories, menuItems } from '@/content/menu';
import type { DietaryTag, MenuCategoryId, MenuItem } from '@/types/content';

export type MenuFilter = MenuCategoryId | 'all';

export function isImageKey(value: string | undefined): value is ImageKey {
  return Boolean(value && value in images);
}

export function itemsInCategory(category: MenuCategoryId, items: MenuItem[] = menuItems): MenuItem[] {
  return items.filter((item) => item.category === category);
}

/** Category filter plus "must satisfy every selected diet" filter. */
export function filterMenu(
  items: MenuItem[],
  category: MenuFilter,
  diets: readonly DietaryTag[] = [],
): MenuItem[] {
  return items.filter(
    (item) =>
      (category === 'all' || item.category === category) &&
      diets.every((diet) => item.dietary.includes(diet)),
  );
}

export function groupedMenu(category: MenuFilter, diets: readonly DietaryTag[] = []) {
  const visible = filterMenu(menuItems, category, diets);
  return menuCategories
    .filter((c) => category === 'all' || c.id === category)
    .map((c) => ({ category: c, items: visible.filter((item) => item.category === c.id) }))
    .filter((group) => group.items.length > 0);
}

export function isMenuFilter(value: string | null | undefined): value is MenuFilter {
  return value === 'all' || menuCategories.some((c) => c.id === value);
}

export function signatureDishes(): MenuItem[] {
  return itemsInCategory('signatures');
}
