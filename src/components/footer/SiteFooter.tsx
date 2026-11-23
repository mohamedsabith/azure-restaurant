import { TransitionLink } from '@/components/motion/TransitionLink';
import { Logo } from '@/components/ui/Logo';
import { formatHoursSummary, navigation, site } from '@/content/site';
import { CreditsDialog } from './CreditsDialog';

function SocialIcon({ name }: { name: 'Instagram' | 'Journal' }) {
  if (name === 'Instagram') {
    return (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
    >
      <path d="M5 4h11l3 3v13H5z" />
      <path d="M8 10h8M8 14h8M8 18h5" />
    </svg>
  );
}

/**
 * Ivory footer: wordmark, serif navigation, social accounts and the address line,
 * then the hours and the demonstration notice. Placeholder details are labelled
 * as such — never invented.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-cream text-forest" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        Site information
      </h2>
      <div className="container-site pt-12 pb-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <TransitionLink href="/" aria-label="AZURE — home" className="-m-2 self-start p-2 text-forest">
            <Logo />
          </TransitionLink>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-8 gap-y-3 font-display text-[1.2rem]">
              {navigation.map((item) => (
                <li key={item.href}>
                  <TransitionLink href={item.href} className="link-draw pb-0.5 hover:text-bronze">
                    {item.label}
                  </TransitionLink>
                </li>
              ))}
              <li>
                <TransitionLink href="/reservations" className="link-draw pb-0.5 hover:text-bronze">
                  Reservations
                </TransitionLink>
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-7">
            <ul className="flex gap-5">
              {site.social.map((account) => (
                <li key={account.label}>
                  {account.href ? (
                    <a href={account.href} rel="me noopener" className="flex text-forest hover:text-bronze">
                      <SocialIcon name={account.label} />
                      <span className="sr-only">{account.label}</span>
                    </a>
                  ) : (
                    <span className="flex text-forest/45" title={`${account.label}: account to be announced`}>
                      <SocialIcon name={account.label} />
                      <span className="sr-only">{account.label}: account to be announced</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <span aria-hidden className="h-10 w-px bg-forest/20" />
            <address className="max-w-[13rem] font-display text-[1.05rem] leading-snug not-italic">
              On the quay, in the old customs house
              <span className="block font-sans text-caption text-taupe">Full address to be confirmed</span>
            </address>
          </div>
        </div>

        <div className="mt-10 grid gap-6 border-t border-forest/12 pt-6 text-caption text-taupe lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="space-y-1.5">
            <p>{formatHoursSummary().join('  ·  ')}</p>
            <p>
              {site.contact.email}
              {site.contact.emailIsPlaceholder && ' (placeholder address)'}
            </p>
            {site.demo && <p className="max-w-3xl">{site.demoNotice}</p>}
          </div>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <li>
              © {year} {site.name}
            </li>
            <li>
              <CreditsDialog />
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
