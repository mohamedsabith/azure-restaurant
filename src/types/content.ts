export type Tone = 'light' | 'dark';

export interface PhotoCredit {
  name: string;
  /** Unsplash username, when known. */
  username?: string;
}

export interface ImageAsset {
  /** Unsplash CDN path segment, e.g. `photo-1519708227418-c8fd9a32b7a2`. */
  id: string;
  alt: string;
  credit: PhotoCredit;
  /** Public Unsplash photo page (license + attribution source). */
  page: string;
  /** CSS object-position used for deliberate crops. */
  position?: string;
  /** Background tone shown while the photo loads or if it fails. */
  tone: Tone;
}

export type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free';

export type Allergen =
  | 'celery'
  | 'gluten'
  | 'crustaceans'
  | 'eggs'
  | 'fish'
  | 'lupin'
  | 'milk'
  | 'molluscs'
  | 'mustard'
  | 'nuts'
  | 'peanuts'
  | 'sesame'
  | 'soy'
  | 'sulphites';

export type MenuCategoryId =
  'chefs-selection' | 'starters' | 'mains' | 'signatures' | 'desserts' | 'beverages';

export interface MenuItem {
  id: string;
  category: MenuCategoryId;
  name: string;
  description: string;
  /** Components listed in the dish detail dialog. */
  ingredients: string[];
  price: number;
  /** e.g. "per guest", "glass" */
  priceNote?: string;
  dietary: DietaryTag[];
  allergens: Allergen[];
  image?: string;
  pairing?: string;
  featured?: boolean;
}

export interface MenuCategory {
  id: MenuCategoryId;
  label: string;
  title: string;
  intro: string;
}

export interface TastingCourse {
  name: string;
  detail: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  attribution: string;
  context: string;
}
