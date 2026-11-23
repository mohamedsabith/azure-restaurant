'use client';

import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useCallback, useMemo, useState } from 'react';
import { useClientSnapshot } from '@/hooks/useClientSnapshot';
import { DishDialog } from '@/components/menu/DishDialog';
import { Picture } from '@/components/ui/Picture';
import { Tooltip } from '@/components/ui/Tooltip';
import { allergenLabels, dietaryLabels, menuCategories, menuItems, tastingMenu } from '@/content/menu';
import { site } from '@/content/site';
import { filterMenu, isImageKey, isMenuFilter, type MenuFilter } from '@/lib/menu';
import { cn, formatPrice } from '@/lib/utils';
import { motion as tokens } from '@/theme/tokens';
import type { DietaryTag, MenuItem } from '@/types/content';

const DIETS: DietaryTag[] = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'];
const price = (n: number) => formatPrice(n, site.currency);

function parseQuery(search: string): { category: MenuFilter; diets: DietaryTag[] } {
  const params = new URLSearchParams(search);
  const category = params.get('category');
  const diets = (params.get('diet') ?? '')
    .split(',')
    .filter((d): d is DietaryTag => DIETS.includes(d as DietaryTag));
  return { category: isMenuFilter(category) ? category : 'all', diets };
}

function writeUrl(category: MenuFilter, diets: DietaryTag[]) {
  const params = new URLSearchParams(window.location.search);
  if (category === 'all') params.delete('category');
  else params.set('category', category);
  if (diets.length) params.set('diet', diets.join(','));
  else params.delete('diet');
  const query = params.toString();
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${query ? `?${query}` : ''}`,
  );
}

/**
 * The full menu is server-rendered (crawlable, works without JS). Filters
 * enhance it on the client and are mirrored in the URL (?category=&diet=)
 * without a navigation, so links to a filtered view can be shared.
 */
export function MenuExplorer() {
  // Server render shows everything; on the client a shared ?category=&diet= link applies until the
  // visitor changes a filter themselves.
  const search = useClientSnapshot(() => window.location.search, '');
  const fromUrl = useMemo(() => parseQuery(search), [search]);
  const [choice, setChoice] = useState<{ category: MenuFilter; diets: DietaryTag[] } | null>(null);
  const { category, diets } = choice ?? fromUrl;
  const [selected, setSelected] = useState<MenuItem | null>(null);

  const update = useCallback((nextCategory: MenuFilter, nextDiets: DietaryTag[]) => {
    setChoice({ category: nextCategory, diets: nextDiets });
    writeUrl(nextCategory, nextDiets);
  }, []);

  const visible = useMemo(() => filterMenu(menuItems, category, diets), [category, diets]);
  const groups = useMemo(
    () =>
      menuCategories
        .map((c) => ({ category: c, items: visible.filter((item) => item.category === c.id) }))
        .filter((g) => g.items.length > 0),
    [visible],
  );

  const toggleDiet = (diet: DietaryTag) =>
    update(category, diets.includes(diet) ? diets.filter((d) => d !== diet) : [...diets, diet]);

  return (
    <>
      <div className="sticky top-(--spacing-header) z-30 border-b border-forest/10 bg-cream/95 backdrop-blur-md">
        <div className="container-site flex flex-col gap-2 py-3 2xl:flex-row 2xl:items-center 2xl:justify-between 2xl:gap-8">
          <div
            role="group"
            aria-label="Menu sections"
            className="-mx-[var(--spacing-gutter)] flex [scrollbar-width:none] gap-1 overflow-x-auto px-[var(--spacing-gutter)] lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
          >
            <LayoutGroup id="menu-category">
              {[{ id: 'all' as const, label: 'All' }, ...menuCategories].map((c) => {
                const active = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => update(c.id, diets)}
                    className={cn(
                      'relative min-h-11 shrink-0 px-4 eyebrow text-[0.65625rem] whitespace-nowrap transition-colors duration-300',
                      active ? 'text-white' : 'text-forest/80 hover:text-forest',
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="menu-category-pill"
                        className="absolute inset-0 -z-0 bg-forest"
                        transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                      />
                    )}
                    <span className="relative">{c.label}</span>
                  </button>
                );
              })}
            </LayoutGroup>
          </div>
          <div role="group" aria-label="Dietary filters" className="flex flex-wrap items-center gap-2">
            <span className="mr-1 eyebrow text-[0.65625rem] text-taupe">Diet</span>
            {DIETS.map((diet) => {
              const on = diets.includes(diet);
              return (
                <button
                  key={diet}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleDiet(diet)}
                  className={cn(
                    'inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-caption font-medium transition-colors duration-300',
                    on
                      ? 'border-bronze bg-bronze text-white'
                      : 'border-forest/20 text-forest hover:border-bronze',
                  )}
                >
                  <span aria-hidden className="font-semibold tabular">
                    {dietaryLabels[diet].short}
                  </span>
                  {dietaryLabels[diet].label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {visible.length === 0
          ? 'No dishes match the selected filters.'
          : `Showing ${visible.length} ${visible.length === 1 ? 'item' : 'items'}.`}
      </p>

      <div className="container-site pb-[var(--spacing-section)]">
        <AnimatePresence mode="popLayout" initial={false}>
          {groups.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-24 text-center"
            >
              <p className="font-display text-h3 text-forest">Nothing matches every filter.</p>
              <p className="mx-auto mt-3 max-w-md text-ink/85">
                The kitchen can adapt most dishes with notice — mention it when you book.
              </p>
              <button
                type="button"
                onClick={() => update('all', [])}
                className="mt-8 link-draw pb-1 text-[0.8125rem] font-semibold tracking-[0.16em] text-bronze uppercase"
              >
                Clear filters
              </button>
            </motion.div>
          ) : (
            groups.map(({ category: c, items }) => (
              <motion.section
                key={c.id}
                layout="position"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.55, ease: tokens.easeOutExpo }}
                aria-labelledby={`menu-${c.id}`}
                id={c.id}
                className="scroll-mt-48 border-b border-forest/10 py-[clamp(3.5rem,7vw,6.5rem)] last:border-b-0"
              >
                <header className="mb-12 grid-editorial gap-y-4">
                  <div className="col-span-4 md:col-span-5 lg:col-span-5">
                    <p className="mb-5 flex items-center gap-5 eyebrow text-bronze">
                      {c.label}
                      <span aria-hidden className="rule w-11" />
                    </p>
                    <h2
                      id={`menu-${c.id}`}
                      className="font-display text-[clamp(2.5rem,1.6rem+2.6vw,3.5rem)] leading-[1.02] [font-weight:400]"
                    >
                      {c.title}
                    </h2>
                  </div>
                  <p className="col-span-4 self-end font-display text-[1.2rem] leading-[1.45] text-taupe md:col-span-3 lg:col-span-4 lg:col-start-9">
                    {c.intro}
                  </p>
                </header>
                {c.id === 'chefs-selection' ? (
                  <TastingSelection items={items} onSelect={setSelected} />
                ) : (
                  <MenuList items={items} onSelect={setSelected} feature={c.id === 'signatures'} />
                )}
              </motion.section>
            ))
          )}
        </AnimatePresence>
      </div>

      <DishDialog dish={selected} onClose={() => setSelected(null)} />
    </>
  );
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

function DietMarks({ tags }: { tags: DietaryTag[] }) {
  if (!tags.length) return null;
  return (
    <span className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Tooltip
          key={tag}
          content={
            <>
              <strong className="font-semibold">{dietaryLabels[tag].label}.</strong>{' '}
              {dietaryLabels[tag].description}
            </>
          }
        >
          <span className="inline-flex h-6 min-w-6 items-center justify-center border border-forest/25 px-1.5 text-[0.6875rem] font-semibold tracking-[0.08em] text-forest tabular">
            <span aria-hidden>{dietaryLabels[tag].short}</span>
            <span className="sr-only">{dietaryLabels[tag].label}</span>
          </span>
        </Tooltip>
      ))}
    </span>
  );
}

function ItemText({ item, onSelect }: { item: MenuItem; onSelect: (item: MenuItem) => void }) {
  return (
    <div className="relative">
      <div className="flex items-baseline justify-between gap-6">
        <h3 className="font-display text-[1.6rem] leading-tight [font-weight:500]">
          {/* Stretched button: the whole row opens the dish, the name stays the accessible label. */}
          <button
            type="button"
            onClick={() => onSelect(item)}
            className="text-left after:absolute after:inset-0 after:content-[''] hover:text-bronze focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-bronze"
            aria-haspopup="dialog"
          >
            {item.name}
          </button>
        </h3>
        <p className="shrink-0 font-display text-[1.45rem] text-bronze tabular">
          {item.priceNote === 'from' && <span className="mr-1 font-sans text-caption text-ink/80">from</span>}
          {price(item.price)}
          {item.priceNote && item.priceNote !== 'from' && (
            <span className="ml-1 font-sans text-caption text-ink/80">/ {item.priceNote}</span>
          )}
        </p>
      </div>
      <p className="mt-1.5 max-w-2xl font-display text-[1.15rem] leading-[1.45] text-taupe">
        {item.description}
      </p>
      <div className="relative z-10 mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <DietMarks tags={item.dietary} />
        {item.allergens.length > 0 && (
          <span className="text-caption text-taupe">
            Allergens: {item.allergens.map((a) => allergenLabels[a].toLowerCase()).join(', ')}
          </span>
        )}
      </div>
    </div>
  );
}

function MenuList({
  items,
  onSelect,
  feature,
}: {
  items: MenuItem[];
  onSelect: (item: MenuItem) => void;
  feature: boolean;
}) {
  const withImages = items.filter((i) => isImageKey(i.image)).slice(0, feature ? 4 : 2);
  return (
    <div className="grid-editorial gap-y-12">
      <ul
        className={cn(
          'col-span-4 divide-y divide-forest/10 self-start border-y border-forest/10 md:col-span-8',
          withImages.length ? 'lg:col-span-7' : 'lg:col-span-10',
        )}
      >
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.li
              key={item.id}
              layout="position"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="group py-6 transition-colors duration-300 hover:bg-white md:px-4"
            >
              <ItemText item={item} onSelect={onSelect} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {withImages.length > 0 && (
        <div
          className={cn(
            'col-span-4 grid gap-4 md:col-span-8 lg:col-span-4 lg:col-start-9',
            feature ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-1',
          )}
        >
          {withImages.map((item, index) =>
            isImageKey(item.image) ? (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                className={cn(
                  'group text-left',
                  !feature && index === 0 && 'lg:pr-10',
                  !feature && index === 1 && 'lg:pl-10',
                )}
                aria-label={`${item.name} — view details`}
              >
                <Picture
                  image={item.image}
                  sizes="(min-width: 1024px) 26vw, 50vw"
                  aspect={feature ? '4 / 5' : '5 / 4'}
                  imgClassName="transition-transform duration-[1600ms] ease-(--ease-out-expo) group-hover:scale-105"
                />
                <span className="mt-2 block font-display text-[1.05rem] text-taupe">{item.name}</span>
              </button>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}

function TastingSelection({ items, onSelect }: { items: MenuItem[]; onSelect: (item: MenuItem) => void }) {
  const [main, ...others] = items;
  return (
    <div className="space-y-16">
      {main && (
        <article className="on-dark grid-editorial items-stretch gap-y-10 bg-forest text-white">
          <div className="col-span-4 md:col-span-8 lg:col-span-6">
            {isImageKey(main.image) && (
              <Picture
                image={main.image}
                sizes="(min-width: 1024px) 50vw, 100vw"
                ground="dark"
                className="aspect-[4/3] w-full lg:aspect-auto lg:h-full lg:min-h-[34rem]"
              />
            )}
          </div>
          <div className="col-span-4 px-6 pb-10 md:col-span-8 md:px-10 lg:col-span-6 lg:px-0 lg:py-14 lg:pr-14">
            <div className="flex items-baseline justify-between gap-6">
              <h3 className="font-display text-[clamp(2rem,1.5rem+1.4vw,2.75rem)] leading-tight text-white">
                {main.name}
              </h3>
              <p className="shrink-0 font-display text-[2.25rem] text-white tabular">{price(main.price)}</p>
            </div>
            <p className="mt-3 font-display text-[1.2rem] leading-[1.45] text-white/90">
              {main.description} {tastingMenu.duration}.
            </p>
            <ol className="mt-8 divide-y divide-white/12 border-y border-white/15">
              {tastingMenu.courses.map((course, index) => (
                <li key={course.name} className="flex items-baseline gap-5 py-3">
                  <span className="w-8 font-display text-[1.05rem] text-parchment">{ROMAN[index]}</span>
                  <span className="text-small text-white/85">
                    <span className="font-display text-[1.4rem] text-white">{course.name}</span>,{' '}
                    {course.detail}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-small text-white/90">{main.pairing}</p>
            <button
              type="button"
              onClick={() => onSelect(main)}
              aria-haspopup="dialog"
              className="mt-8 link-draw pb-1 text-[0.8125rem] font-semibold tracking-[0.16em] text-white uppercase"
            >
              Allergens & details
            </button>
          </div>
        </article>
      )}
      {others.length > 0 && <MenuList items={others} onSelect={onSelect} feature={false} />}
    </div>
  );
}
