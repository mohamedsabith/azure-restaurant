import { allergenLabels, allergenPolicy, dietaryLabels, menuMeta } from '@/content/menu';

export function DietaryGuide() {
  return (
    <section id="dietary" aria-labelledby="dietary-title" className="bg-sand section-y">
      <div className="container-site grid-editorial gap-y-12">
        <div className="col-span-4 md:col-span-8 lg:col-span-4">
          <p data-reveal className="mb-6 flex items-center gap-4 eyebrow text-bronze">
            <span aria-hidden className="h-px w-10 bg-bronze/50" />
            Dietary information
          </p>
          <h2 id="dietary-title" data-split-lines className="text-h2">
            Allergies and diets.
          </h2>
          <div data-reveal className="mt-7 space-y-4 text-ink/90">
            {allergenPolicy.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
          </div>
          <p data-reveal className="mt-6 text-caption text-ink/80">
            {menuMeta.serviceNote}
          </p>
        </div>

        <div className="col-span-4 md:col-span-4 lg:col-span-3 lg:col-start-6">
          <h3 data-reveal className="mb-5 eyebrow text-moss">
            Labels on this menu
          </h3>
          <dl data-reveal-stagger className="space-y-5">
            {Object.values(dietaryLabels).map((d) => (
              <div key={d.short} className="flex gap-4">
                <dt className="inline-flex h-7 min-w-8 items-center justify-center border border-bronze/40 text-caption font-semibold text-bronze tabular">
                  {d.short}
                </dt>
                <dd className="text-small">
                  <span className="font-semibold text-moss">{d.label}.</span>{' '}
                  <span className="text-ink/85">{d.description}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="col-span-4 md:col-span-4 lg:col-span-3 lg:col-start-10">
          <h3 data-reveal className="mb-5 eyebrow text-moss">
            The 14 major allergens
          </h3>
          <ul data-reveal-stagger className="columns-2 gap-6 text-small text-ink/90 lg:columns-1">
            {Object.values(allergenLabels).map((label) => (
              <li key={label} className="mb-2 break-inside-avoid">
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
