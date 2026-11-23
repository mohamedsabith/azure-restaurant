import Image from 'next/image';
import type { CSSProperties } from 'react';
import { images, type ImageKey } from '@/content/images';
import type { ImageAsset } from '@/types/content';
import { unsplashSrc } from '@/lib/images/loader';
import { cn } from '@/lib/utils';

interface PictureProps {
  image: ImageKey;
  /** Accurate `sizes` keeps downloads small: always describe the rendered width. */
  sizes: string;
  className?: string;
  imgClassName?: string;
  /** e.g. "4 / 5". Omit when the parent sets the size. */
  aspect?: string;
  preload?: boolean;
  alt?: string;
  /** Mask reveal picked up by MotionScope: upwards (true), from a centred slit ('window') or downwards. */
  reveal?: boolean | 'window' | 'down' | 'iris' | 'tide';
  /** Seconds to wait before the reveal, to stagger photographs that arrive together. */
  revealDelay?: number;
  parallax?: number;
  position?: string;
  quality?: number;
  /** Placeholder colour while the photograph loads: pale on light grounds, navy on dark ones. */
  ground?: 'light' | 'dark';
}

export function Picture({
  image,
  sizes,
  className,
  imgClassName,
  aspect,
  preload = false,
  alt,
  reveal = false,
  revealDelay,
  parallax,
  position,
  quality,
  ground = 'light',
}: PictureProps) {
  const asset: ImageAsset = images[image];
  const style: CSSProperties = aspect ? { aspectRatio: aspect } : {};
  // Callers may position the frame themselves (e.g. `absolute inset-0` backgrounds).
  const positioned = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className ?? '');
  return (
    <div
      className={cn(
        !positioned && 'relative',
        'overflow-hidden',
        ground === 'dark' ? 'bg-moss' : 'bg-sand',
        className,
      )}
      style={style}
      data-reveal-mask={reveal === true ? '' : reveal || undefined}
      data-reveal-delay={reveal && revealDelay ? revealDelay : undefined}
    >
      <Image
        src={unsplashSrc(asset.id)}
        alt={alt ?? asset.alt}
        fill
        sizes={sizes}
        preload={preload}
        fetchPriority={preload ? 'high' : undefined}
        quality={quality}
        className={cn('object-cover', parallax ? 'scale-[1.14]' : '', imgClassName)}
        style={{ objectPosition: position ?? asset.position ?? '50% 50%' }}
        data-parallax={parallax}
      />
    </div>
  );
}
