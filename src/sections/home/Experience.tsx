import { TextLink } from '@/components/ui/Button';
import { Botanical } from '@/components/ui/Botanical';
import { Picture } from '@/components/ui/Picture';
import { SectionIntro } from '@/components/ui/SectionIntro';
import { home } from '@/content/pages';

/** Dark text panel beside a candlelit table, split edge to edge. */
export function Experience() {
  const { experience } = home;
  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className="on-dark grid bg-forest text-white md:grid-cols-2"
    >
      <div className="relative flex flex-col justify-center overflow-hidden px-[var(--spacing-gutter)] py-[clamp(4rem,8vw,7rem)] md:px-[clamp(2.5rem,5vw,5rem)]">
        <Botanical className="absolute -bottom-28 -left-20 h-[24rem] w-72 text-white/10" />
        <SectionIntro
          tone="light"
          eyebrow={experience.eyebrow}
          title={experience.title}
          id="experience-title"
          className="relative"
        >
          <p>{experience.text}</p>
        </SectionIntro>
        <div data-reveal className="relative mt-10 flex flex-wrap gap-x-9 gap-y-5">
          <TextLink href="/menu" tone="light">
            The tasting menu
          </TextLink>
          <TextLink href="/reservations#private-dining" tone="light">
            Private dining
          </TextLink>
        </div>
      </div>
      <div className="relative order-first min-h-[22rem] overflow-hidden border-white/15 md:order-none md:min-h-[34rem] md:border-l">
        <div data-window-scrub="lights" className="absolute inset-0">
          <Picture
            image={experience.image}
            position="40% 50%"
            sizes="(min-width: 768px) 50vw, 100vw"
            parallax={0.1}
            ground="dark"
            className="absolute inset-0"
          />
        </div>
      </div>
    </section>
  );
}
