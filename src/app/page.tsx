import { MotionScope } from '@/animations/MotionScope';
import { pageMetadata } from '@/lib/seo/metadata';
import { Experience } from '@/sections/home/Experience';
import { FilmSection } from '@/sections/home/FilmSection';
import { FindUs } from '@/sections/home/FindUs';
import { GuestNotes } from '@/sections/home/GuestNotes';
import { GalleryStrip } from '@/sections/home/GalleryStrip';
import { HomeHero } from '@/sections/home/HomeHero';
import { InstallationSection } from '@/sections/home/InstallationSection';
import { IntroSequence } from '@/sections/home/IntroSequence';
import { Philosophy } from '@/sections/home/Philosophy';
import { SignatureDishes } from '@/sections/home/SignatureDishes';
import { Roadmap } from '@/sections/shared/Roadmap';
import { TableAwaits } from '@/sections/shared/TableAwaits';
import { home, storyTimeline } from '@/content/pages';

export const metadata = pageMetadata('home');

export default function HomePage() {
  return (
    <>
      <IntroSequence />
      <HomeHero />
      <MotionScope>
        <Philosophy />
        <Roadmap
          id="story-title"
          eyebrow={home.story.eyebrow}
          title={home.story.title}
          intro={home.story.intro}
          milestones={storyTimeline}
        />
        <SignatureDishes />
        <FilmSection />
        <InstallationSection />
        <Experience />
        <GuestNotes />
        <GalleryStrip />
        <FindUs />
        <TableAwaits />
      </MotionScope>
    </>
  );
}
