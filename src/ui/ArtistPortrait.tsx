import Image from 'next/image'
import { ANNOUNCING_SOON, site } from '@/content/site'
import { AnnouncingSoon } from './AnnouncingSoon'

interface ArtistPortraitProps {
  name: string
  photo: string | null
  className?: string
}

/**
 * The headline artist's portrait. Until the client sends a photo it is an
 * empty frame that says so in the site's own "Announcing soon" voice.
 */
export function ArtistPortrait({ name, photo, className = '' }: ArtistPortraitProps) {
  return (
    <figure className={`artist-portrait relative aspect-[4/5] w-full max-w-[340px] ${className}`}>
      {photo ? (
        <Image
          src={photo}
          alt={`${name}, headline artist`}
          fill
          sizes="(max-width: 768px) 80vw, 340px"
          className="object-cover"
        />
      ) : (
        <div className="artist-portrait-empty absolute inset-3 flex flex-col items-center justify-end gap-2 pb-8 text-center">
          <figcaption className="font-cinzel text-[13px] uppercase tracking-[0.28em] text-[var(--world-text)]">
            {name}
          </figcaption>
          <AnnouncingSoon
            value={`${site.ui.portraitSoon} · ${ANNOUNCING_SOON}`}
            className="font-manrope text-[12px] text-[var(--world-muted)]"
          />
        </div>
      )}
    </figure>
  )
}
