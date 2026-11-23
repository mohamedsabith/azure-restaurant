import { TextLink } from '@/components/ui/Button';
import { Botanical } from '@/components/ui/Botanical';
import { Picture } from '@/components/ui/Picture';
import { SectionIntro } from '@/components/ui/SectionIntro';
import { home } from '@/content/pages';

/** Photograph and ivory panel side by side, edge to edge; the sprig draws itself on arrival. */
export function Philosophy() {
  const { philosophy } = home;
  return (
    <section aria-labelledby="philosophy-title" className="grid bg-linen md:grid-cols-2">
      <div className="relative min-h-[22rem] overflow-hidden md:min-h-[38rem]">
        <div data-reveal-mask="tide" className="absolute inset-0">
          <Picture
            image={philosophy.image}
            position={philosophy.imagePosition}
            sizes="(min-width: 768px) 50vw, 100vw"
            parallax={0.1}
            className="absolute inset-0"
          />
        </div>
      </div>
      <div className="relative flex flex-col justify-center overflow-hidden px-[var(--spacing-gutter)] py-[clamp(4rem,8vw,7rem)] md:px-[clamp(2.5rem,6vw,6rem)]">
        <Botanical className="absolute -top-2 -right-8 h-[19rem] w-[14.5rem] text-moss/45 max-sm:-right-24 max-sm:opacity-60" />
        <SectionIntro
          eyebrow={philosophy.eyebrow}
          title={philosophy.title}
          id="philosophy-title"
          className="relative"
        >
          <p>{philosophy.text}</p>
        </SectionIntro>
        <p data-reveal className="relative mt-10">
          <TextLink href="/our-story">Our story</TextLink>
        </p>
      </div>
    </section>
  );
}
