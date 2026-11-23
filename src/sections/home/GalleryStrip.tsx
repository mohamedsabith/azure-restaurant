import { Picture } from '@/components/ui/Picture';
import { home } from '@/content/pages';

/** Edge-to-edge strip of photographs from the kitchen and the room. */
export function GalleryStrip() {
  return (
    <section id="gallery" aria-labelledby="gallery-title" className="bg-forest">
      <h2 id="gallery-title" className="sr-only">
        Gallery
      </h2>
      <ul className="grid grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
        {home.gallery.map((item, index) => (
          <li key={item.image}>
            <figure
              data-reveal-mask={index % 2 ? 'down' : ''}
              data-reveal-delay={(index * 0.12).toFixed(2)}
              className="group relative h-[14rem] overflow-hidden sm:h-[18rem] lg:h-[22rem]"
            >
              <Picture
                image={item.image}
                sizes="(min-width: 1024px) 30vw, 50vw"
                parallax={0.06}
                ground="dark"
                className="absolute inset-0"
                imgClassName="transition-[scale] duration-[1600ms] ease-(--ease-out-expo) group-hover:scale-[1.2]"
              />
              <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-forest/90 px-5 py-3 font-display text-[1.05rem] text-white transition-transform duration-500 ease-(--ease-out-expo) group-focus-within:translate-y-0 group-hover:translate-y-0">
                {item.caption}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
