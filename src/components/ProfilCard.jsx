import { useCallback, useEffect, useRef, useState } from 'react'
import './ProfilCard.css'

/**
 * ProfileCard — kartu holografik dengan efek tilt, kilau, dan parallax.
 * Struktur DOM & nama class mengikuti ProfilCard.css.
 *
 * Contoh:
 *   <ProfileCard name="Nama" title="Jabatan" handle="username"
 *     avatarUrl="/foto.jpg" theme="auto" onContactClick={...} />
 */

const clamp = (v, min = 0, max = 100) => Math.min(Math.max(v, min), max)
const round = (v, p = 3) => parseFloat(v.toFixed(p))

const svgUrl = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

// Pola belah ketupat untuk mask hologram (dipakai kalau iconUrl tidak diisi)
const DEFAULT_PATTERN = svgUrl(
  '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44"><path d="M22 5l7 17-7 17-7-17z" fill="white"/></svg>'
)

// Butiran halus untuk lapisan kilau
const GRAIN = svgUrl(
  '<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>'
)

const THEMES = {
  dark: {
    '--pc-frame': 'rgba(24, 24, 32, 0.55)',
    '--pc-frame-shadow':
      '0 32px 64px -26px rgba(0, 0, 0, 0.75), 0 0 64px -20px rgba(139, 92, 246, 0.5)',
    '--pc-frame-edge': 'rgba(255, 255, 255, 0.12)',
    '--pc-frame-highlight': 'rgba(255, 255, 255, 0.2)',
    '--pc-backdrop': '#15151b',
    '--pc-tile': 'rgba(255, 255, 255, 0.08)',
    '--pc-tile-edge': 'rgba(255, 255, 255, 0.12)',
    '--pc-tile-highlight': 'rgba(255, 255, 255, 0.16)',
    '--pc-tile-shadow': '0 6px 16px -8px rgba(0, 0, 0, 0.6)',
    '--pc-ink': '#ffffff',
    '--pc-muted': 'rgba(255, 255, 255, 0.62)',
    '--pc-status': '#34d399',
    '--pc-sheen': 'rgba(255, 255, 255, 0.35)',
    '--pc-shade': 'rgba(0, 0, 0, 0.4)',
    '--pc-press': 'brightness(0.85)',
    '--pc-hover': 'brightness(1.25)',
    '--pc-blend': 'color-dodge',
    '--pc-holo-filter': 'opacity(1)',
    '--pc-holo-gain': 0.9,
    '--pc-holo-detail': 0.55,
  },
  light: {
    '--pc-frame': 'rgba(255, 255, 255, 0.72)',
    '--pc-frame-shadow':
      '0 30px 60px -28px rgba(60, 40, 120, 0.4), 0 0 50px -20px rgba(124, 58, 237, 0.3)',
    '--pc-frame-edge': 'rgba(0, 0, 0, 0.08)',
    '--pc-frame-highlight': 'rgba(255, 255, 255, 0.95)',
    '--pc-backdrop': '#e9e4f8',
    '--pc-tile': 'rgba(255, 255, 255, 0.9)',
    '--pc-tile-edge': 'rgba(0, 0, 0, 0.08)',
    '--pc-tile-highlight': 'rgba(255, 255, 255, 0.95)',
    '--pc-tile-shadow': '0 4px 12px -6px rgba(0, 0, 0, 0.22)',
    '--pc-ink': '#1b1530',
    '--pc-muted': 'rgba(27, 21, 48, 0.62)',
    '--pc-status': '#10b981',
    '--pc-sheen': 'rgba(255, 255, 255, 0.5)',
    '--pc-shade': 'rgba(0, 0, 0, 0.2)',
    '--pc-press': 'brightness(0.92)',
    '--pc-hover': 'brightness(0.97)',
    '--pc-blend': 'overlay',
    '--pc-holo-filter': 'opacity(1)',
    '--pc-holo-gain': 0.8,
    '--pc-holo-detail': 0.45,
  },
}

// theme="auto" -> ikut atribut data-theme pada <html> (tombol tema di navbar)
function useResolvedTheme(theme) {
  const [auto, setAuto] = useState('dark')

  useEffect(() => {
    if (theme !== 'auto') return undefined
    const read = () =>
      setAuto(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark')
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [theme])

  return theme === 'auto' ? auto : theme
}

export default function ProfileCard({
  name = 'Nama Lengkap',
  title = 'Jabatan',
  handle = 'username',
  status = 'Online',
  contactText = 'Contact',
  avatarUrl = '',
  miniAvatarUrl,
  iconUrl,
  holo = 0.6,
  glare = 0.5,
  tiltStrength = 12,
  parallax = 8,
  radius = 16,
  enableTilt = true,
  intro = true,
  showUserInfo = true,
  enableMobileTilt = false,
  theme = 'dark',
  onContactClick,
}) {
  const rootRef = useRef(null)
  const tileRef = useRef(null)
  const cur = useRef({ px: 50, py: 50, active: 0 })
  const target = useRef({ px: 50, py: 50, active: 0 })
  const rafRef = useRef(0)
  const touchedRef = useRef(false)

  const resolvedTheme = useResolvedTheme(theme)

  // Tulis variabel CSS dinamis sesuai posisi pointer saat ini
  const apply = useCallback(
    (c) => {
      const root = rootRef.current
      const tile = tileRef.current
      if (!root || !tile) return

      const cx = c.px - 50
      const cy = c.py - 50
      const reach = clamp(Math.hypot(cx, cy) / 50, 0, 1)
      const set = (k, v) => root.style.setProperty(k, v)

      set('--pc-pointer-x', `${round(c.px)}%`)
      set('--pc-pointer-y', `${round(c.py)}%`)
      set('--pc-light-x', `${round((c.px / 100) * tile.offsetWidth)}px`)
      set('--pc-light-y', `${round((c.py / 100) * tile.offsetHeight)}px`)
      set('--pc-band-x', `${round(35 + c.px * 0.3)}%`)
      set('--pc-band-y', `${round(35 + c.py * 0.3)}%`)
      set('--pc-rotate-x', `${round(-(cy / 50) * tiltStrength)}deg`)
      set('--pc-rotate-y', `${round((cx / 50) * tiltStrength)}deg`)
      set('--pc-shift-x', `${round(-(cx / 50) * parallax)}px`)
      set('--pc-shift-y', `${round(-(cy / 50) * parallax)}px`)
      set('--pc-reach', round(reach))
      set('--pc-tilt', round(reach * c.active))
      set('--pc-active', round(c.active))
    },
    [tiltStrength, parallax]
  )

  // Loop animasi halus menuju nilai target
  const tick = useCallback(() => {
    const c = cur.current
    const t = target.current
    let moving = false
    for (const key of ['px', 'py', 'active']) {
      const d = t[key] - c[key]
      if (Math.abs(d) > 0.01) {
        c[key] += d * 0.14
        moving = true
      } else {
        c[key] = t[key]
      }
    }
    apply(c)
    rafRef.current = moving ? requestAnimationFrame(tick) : 0
  }, [apply])

  const kick = useCallback(() => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const allowed = (e) => {
    if (!enableTilt || reduced()) return false
    if (e.pointerType === 'touch' && !enableMobileTilt) return false
    return true
  }

  const toPercent = (e) => {
    const root = rootRef.current
    const tile = tileRef.current
    const rect = root.getBoundingClientRect()
    const x = e.clientX - rect.left - tile.offsetLeft
    const y = e.clientY - rect.top - tile.offsetTop
    return {
      px: clamp((x / tile.offsetWidth) * 100),
      py: clamp((y / tile.offsetHeight) * 100),
    }
  }

  const handleEnter = (e) => {
    if (!allowed(e)) return
    touchedRef.current = true
    Object.assign(target.current, toPercent(e), { active: 1 })
    kick()
  }

  const handleMove = (e) => {
    if (!allowed(e)) return
    touchedRef.current = true
    Object.assign(target.current, toPercent(e), { active: 1 })
    kick()
  }

  const handleLeave = () => {
    Object.assign(target.current, { px: 50, py: 50, active: 0 })
    kick()
  }

  // Nilai awal + animasi pembuka singkat
  useEffect(() => {
    apply(cur.current)

    if (!enableTilt || !intro || reduced()) return undefined

    const steps = [
      [250, { px: 24, py: 30, active: 1 }],
      [800, { px: 78, py: 64, active: 1 }],
      [1450, { px: 50, py: 50, active: 0 }],
    ]
    const timers = steps.map(([delay, value]) =>
      setTimeout(() => {
        if (touchedRef.current) return
        Object.assign(target.current, value)
        kick()
      }, delay)
    )

    return () => timers.forEach(clearTimeout)
  }, [apply, kick, enableTilt, intro])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const vars = {
    ...THEMES[resolvedTheme === 'light' ? 'light' : 'dark'],
    '--pc-radius': `${radius}px`,
    '--pc-holo': holo,
    '--pc-glare': glare,
    '--pc-parallax': `${parallax}px`,
    '--pc-pattern': iconUrl ? `url("${iconUrl}")` : DEFAULT_PATTERN,
    '--pc-pattern-size': iconUrl ? '110px 110px' : '44px 44px',
    '--pc-grain': GRAIN,
  }

  return (
    <div
      ref={rootRef}
      className="profile-card"
      style={vars}
      onPointerEnter={handleEnter}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onPointerCancel={handleLeave}
    >
      <div className="profile-card__body">
        <div ref={tileRef} className="profile-card__tile">
          <img
            className="profile-card__photo"
            src={avatarUrl}
            alt={name}
            decoding="async"
            draggable="false"
          />
          <div className="profile-card__holo" aria-hidden="true">
            <div className="profile-card__holo-glow" />
            <div className="profile-card__holo-shift" />
          </div>
          <div className="profile-card__sheen" aria-hidden="true" />
          <div className="profile-card__scrim" aria-hidden="true" />
          <div className="profile-card__info">
            <h3 className="profile-card__name">{name}</h3>
            <p className="profile-card__title">{title}</p>
          </div>
          <div className="profile-card__glare" aria-hidden="true" />
          <div className="profile-card__shade" aria-hidden="true" />
          <div className="profile-card__tile-rim" aria-hidden="true" />
        </div>

        {showUserInfo && (
          <div className="profile-card__footer">
            <div className="profile-card__avatar">
              <img src={miniAvatarUrl || avatarUrl} alt="" decoding="async" draggable="false" />
            </div>
            <div className="profile-card__meta">
              <span className="profile-card__handle">@{handle}</span>
              <span className="profile-card__status">{status}</span>
            </div>
            <button type="button" className="profile-card__contact" onClick={onContactClick}>
              {contactText}
            </button>
          </div>
        )}

        <div className="profile-card__rim" aria-hidden="true" />
      </div>
    </div>
  )
}