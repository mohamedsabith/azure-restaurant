import { site } from '@/content/site';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';

export function DemoNotice({ className, tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  if (!site.demo) return null;
  return (
    <p
      className={cn(
        'flex items-start gap-3 border-l-2 py-3 pr-4 pl-4 text-small',
        tone === 'light' ? 'border-bronze bg-sand text-moss' : 'border-sage bg-white/5 text-white/85',
        className,
      )}
    >
      <Icon name="info" className="mt-0.5 size-[1.1rem]" />
      <span>
        <strong className="font-semibold">Demonstration only.</strong> {site.demoNotice}
      </span>
    </p>
  );
}
