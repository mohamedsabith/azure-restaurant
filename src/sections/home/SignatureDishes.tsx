import { TransitionLink } from '@/components/motion/TransitionLink';
import { Botanical } from '@/components/ui/Botanical';
import { Icon } from '@/components/ui/Icon';
import { Picture } from '@/components/ui/Picture';
import { SectionIntro } from '@/components/ui/SectionIntro';
import { menuItems } from '@/content/menu';
import { isImageKey } from '@/lib/menu';
import { home } from '@/content/pages';
import { formatPrice } from '@/lib/utils';

/** Three signature plates as cards, closed by a dark "view full menu" tile. */
export function SignatureDishes() {
  const { signatures } = home;
  const dishes = signatures.dishIds
    .map((id) => menuItems.find((item) => item.id === id))
    .filter((item): item is (typeof menuItems)[number] => Boolean(item));

  return (
    <section
      aria-labelledby="dishes-title"
      className="bg-cream pt-[clamp(4.5rem,8vw,7rem)] pb-[clamp(5rem,9vw,8rem)]"
    >
      <div className="container-site">
        <SectionIntro
          align="center"
          eyebrow={signatures.eyebrow}
          title={signatures.title}
          id="dishes-title"
        />
        <ul
          data-reveal-stagger
          className="mt-[clamp(2.5rem,5vw,4rem)] grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,0.62fr)]"
        >
          {dishes.map((dish, index) => (
            <li key={dish.id}>
              <TransitionLink href="/menu" className="group block">
                <span className="block overflow-hidden">
                  {isImageKey(dish.image) && (
                    <Picture
                      image={dish.image}
                      aspect="5 / 3.4"
                      reveal="iris"
                      revealDelay={index * 0.16}
                      sizes="(min-width: 1024px) 26vw, (min-width: 640px) 46vw, 92vw"
                      imgClassName="transition-transform duration-[1600ms] ease-(--ease-out-expo) group-hover:scale-105"
                    />
                  )}
                </span>
                <span className="mt-5 block font-display text-[1.6rem] leading-tight text-forest capitalize transition-colors duration-300 group-hover:text-bronze">
                  {dish.name}
                </span>
                <span className="mt-1.5 block font-display text-[1.125rem] leading-snug text-taupe">
                  {dish.description}
                </span>
                <span className="mt-2.5 block font-display text-[1.2rem] text-bronze tabular">
                  {formatPrice(dish.price)}
                </span>
              </TransitionLink>
            </li>
          ))}
          <li className="sm:col-span-2 lg:col-span-1">
            <TransitionLink
              href="/menu"
              className="group on-dark relative flex h-full min-h-56 flex-col justify-center overflow-hidden bg-forest px-8 py-10 text-white transition-colors duration-500 hover:bg-bronze"
            >
              <Botanical
                animated={false}
                className="absolute -right-14 -bottom-12 h-72 w-56 text-white/20 transition-transform duration-[1600ms] ease-(--ease-out-expo) group-hover:-translate-y-2 group-hover:rotate-3"
              />
              <span className="relative eyebrow leading-[2]">
                View
                <br />
                full menu
              </span>
              <Icon
                name="arrowRight"
                className="relative mt-5 size-5 transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-x-2"
              />
            </TransitionLink>
          </li>
        </ul>
      </div>
    </section>
  );
}
