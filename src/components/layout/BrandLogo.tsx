import logo from '../../assets/logo-vj.png'

type BrandLogoProps = {
  /** Texto alternativo; vazio quando o nome "ViajaJunto" já está ao lado. */
  alt?: string
  /** `md` (40 px) na barra superior; `lg` (48 px) nas telas de login. */
  size?: 'md' | 'lg'
}

/** Logo VJ em Rubi. É o único lugar que usa o arquivo da marca. */
export function BrandLogo({ alt = 'ViajaJunto', size = 'lg' }: BrandLogoProps) {
  return (
    <img
      src={logo}
      alt={alt}
      width={size === 'md' ? 58 : 70}
      height={size === 'md' ? 40 : 48}
      className={`w-auto ${size === 'md' ? 'h-10' : 'h-12'}`}
    />
  )
}
