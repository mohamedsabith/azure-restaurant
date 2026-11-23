'use client';

import { DietaryTags } from '@/components/menu/DietaryTags';
import { ButtonLink } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { Picture } from '@/components/ui/Picture';
import { allergenLabels, dietaryLabels, menuCategories } from '@/content/menu';
import { site } from '@/content/site';
import { isImageKey } from '@/lib/menu';
import { cn, formatPrice } from '@/lib/utils';
import type { MenuItem } from '@/types/content';

export function DishDialog({ dish, onClose }: { dish: MenuItem | null; onClose: () => void }) {
  const category = dish ? menuCategories.find((c) => c.id === dish.category) : undefined;
  const hasImage = Boolean(dish && isImageKey(dish.image));

  return (
    <Dialog
      open={Boolean(dish)}
      onOpenChange={(open) => !open && onClose()}
      labelledBy="dish-title"
      describedBy="dish-description"
      className={cn(!hasImage && 'max-w-2xl')}
    >
      {dish && (
        <div className={cn('grid', hasImage && 'md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]')}>
          {hasImage && isImageKey(dish.image) && (
            <Picture
              image={dish.image}
              sizes="(min-width: 768px) 45vw, 100vw"
              className="aspect-[4/3] md:aspect-auto md:min-h-full"
            />
          )}
          <div className="relative p-6 sm:p-8 md:p-10 lg:p-12">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 inline-flex size-12 items-center justify-center text-moss"
              aria-label="Close dish details"
            >
              <Icon name="close" className="size-6" />
            </button>
            <p className="mb-4 pr-12 eyebrow text-bronze">{category?.label}</p>
            <h2 id="dish-title" className="pr-10 text-h3">
              {dish.name}
            </h2>
            <p id="dish-description" className="mt-4 text-ink/90">
              {dish.description}
            </p>
            <p className="mt-6 font-display text-h4 text-moss tabular">
              {formatPrice(dish.price, site.currency)}
              {dish.priceNote && (
                <span className="ml-2 font-sans text-caption text-ink/80">{dish.priceNote}</span>
              )}
            </p>

            <dl className="mt-8 space-y-6 border-t border-moss/10 pt-6 text-small">
              <div>
                <dt className="mb-2 eyebrow text-moss">
                  {dish.category === 'chefs-selection' ? 'Courses' : 'Composition'}
                </dt>
                <dd>
                  <ul className="space-y-1 text-ink/90">
                    {dish.ingredients.map((ingredient) => (
                      <li key={ingredient}>{ingredient}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="mb-2 eyebrow text-moss">Dietary</dt>
                <dd>
                  {dish.dietary.length ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <DietaryTags tags={dish.dietary} />
                      <span className="text-ink/85">
                        {dish.dietary.map((d) => dietaryLabels[d].label).join(' · ')}
                      </span>
                    </div>
                  ) : (
                    <span className="text-ink/85">Can be adapted for most diets with notice.</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="mb-2 eyebrow text-moss">Allergens</dt>
                <dd className="text-ink/90">
                  {dish.allergens.length
                    ? dish.allergens.map((a) => allergenLabels[a]).join(', ')
                    : 'None of the 14 major allergens by recipe.'}
                </dd>
              </div>
              {dish.pairing && (
                <div>
                  <dt className="mb-2 eyebrow text-moss">Pairing</dt>
                  <dd className="text-ink/90">{dish.pairing}</dd>
                </div>
              )}
            </dl>

            <div className="mt-10">
              <ButtonLink href="/reservations" arrow onClick={onClose}>
                Reserve a table
              </ButtonLink>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
