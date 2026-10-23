import { useState, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import type { ResolvedImage } from './calcImages'

/**
 * Dekoratives Foto, das seinen Container wie `object-fit: cover` füllt, ohne zu verzerren. Mit `crop` ist nur der
 * angegebene Bildbereich sichtbar (über Container-Einheiten skaliert und auf die Bereichsmitte gelegt).
 * Fehlt das Bild oder lädt es nicht, bleibt der Farbverlauf `fallback` stehen.
 */
export function CroppedPhoto({ image, fallback, className }: { image?: ResolvedImage; fallback: string; className?: string }) {
  const [ratio, setRatio] = useState<number | null>(null)
  const [failed, setFailed] = useState(false)
  const crop = image?.crop

  let style: CSSProperties | undefined
  if (crop && ratio) {
    // Breite so wählen, dass der Ausschnitt den Container in beiden Richtungen deckt
    const iw = `max(100cqw / ${crop.w}, 100cqh / ${crop.h} * ${ratio})`
    style = {
      position: 'absolute',
      maxWidth: 'none',
      width: iw,
      height: 'auto',
      left: `calc(50cqw - ${crop.x + crop.w / 2} * ${iw})`,
      top: `calc(50cqh - ${crop.y + crop.h / 2} * ${iw} / ${ratio})`,
    }
  }

  return (
    <div aria-hidden className={cn('absolute inset-0 overflow-hidden [container-type:size]', fallback, className)}>
      {image && !failed && (
        <img
          src={image.src}
          alt=""
          decoding="async"
          onLoad={(e) => setRatio(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
          onError={() => setFailed(true)}
          style={style}
          className={cn('transition-opacity duration-500', !crop && 'absolute inset-0 size-full object-cover', crop && !ratio ? 'opacity-0' : 'opacity-100')}
        />
      )}
    </div>
  )
}
