import { ButtonLink } from '@/components/ui/Button';
import { Botanical } from '@/components/ui/Botanical';
import { home } from '@/content/pages';

/** Closing reservation band: italic serif on forest green over a faint, drifting leaf texture. */
export function TableAwaits() {
  const { cta } = home;
  return (
    <section
      aria-labelledby="table-awaits-title"
      className="on-dark relative isolate overflow-hidden border-t border-white/12 bg-forest text-white"
    >
      <div aria-hidden data-parallax="0.12" className="absolute inset-0 -z-10">
        <Botanical
          animated={false}
          className="absolute -top-16 -left-10 h-[22rem] w-[17rem] text-white/[0.07]"
        />
        <Botanical
          animated={false}
          className="absolute -right-6 -bottom-24 h-[26rem] w-[20rem] -scale-x-100 text-white/[0.07]"
        />
        <Botanical
          animated={false}
          className="absolute top-2 left-[38%] hidden h-[14rem] w-[11rem] rotate-[25deg] text-white/[0.05] md:block"
        />
      </div>
      <div className="container-site flex flex-col items-center justify-center gap-x-16 gap-y-8 py-[clamp(3.5rem,6vw,5.5rem)] text-center md:flex-row">
        <div>
          <h2
            id="table-awaits-title"
            data-letters
            className="font-display text-[clamp(2.5rem,1.8rem+2.4vw,3.5rem)] leading-none [font-weight:400] text-white italic"
          >
            {cta.title}
          </h2>
          <p data-reveal className="mt-3 font-display text-[1.25rem] text-white/88">
            {cta.text}
          </p>
        </div>
        <div data-reveal>
          <ButtonLink href="/reservations" variant="outline-light" arrow className="min-h-14 px-8">
            Make a reservation
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
