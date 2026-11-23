import { Botanical } from '@/components/ui/Botanical';
import { SectionIntro } from '@/components/ui/SectionIntro';
import { home } from '@/content/pages';
import { InstallationStage } from '@/three/InstallationStage';

/** The wine pairing, with a live 3D glass of white wine on the forest-green ground. */
export function InstallationSection() {
  const { installation } = home;
  return (
    <section
      aria-labelledby="installation-title"
      className="on-dark relative isolate overflow-hidden bg-forest text-white"
    >
      <Botanical className="absolute -bottom-24 -left-16 -z-10 h-[26rem] w-80 text-white/10" />
      <div className="container-site grid-editorial items-center gap-y-12 py-[clamp(4.5rem,9vw,8rem)]">
        <div className="col-span-4 md:col-span-6 lg:col-span-5">
          <SectionIntro
            tone="light"
            eyebrow={installation.eyebrow}
            title={installation.title}
            id="installation-title"
          >
            <p>{installation.text}</p>
          </SectionIntro>
          <p
            data-reveal
            className="mt-10 max-w-xs border-l border-parchment/60 pl-4 text-caption text-white/80"
          >
            {installation.caption}
          </p>
        </div>
        <div className="col-span-4 md:col-span-8 lg:col-span-7">
          <div data-reveal-mask="window">
            <InstallationStage
              className="aspect-[4/5] md:aspect-[5/4] lg:aspect-auto lg:h-[min(84vh,900px)]"
              sizes="(min-width: 1024px) 58vw, 100vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
