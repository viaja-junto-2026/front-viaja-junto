import { cva, type VariantProps } from 'class-variance-authority'
import { focusRing } from './focus'

/** Formato de cada variante de botão (altura, raio, espaçamento e texto). */
export const buttonShape = cva(
  `inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors disabled:cursor-not-allowed ${focusRing}`,
  {
    variants: {
      variant: {
        primary: 'h-12 rounded-md px-6 text-label-lg',
        secondary: 'h-12 rounded-md px-6 text-label-lg',
        compact: 'h-9 rounded-sm px-3 text-label-md',
        danger: 'h-12 rounded-md px-6 text-label-lg',
        pill: 'h-14 rounded-full px-6 text-label-lg',
        // Estilo editorial (retangular, em maiúsculas), usado na home.
        solid: 'h-12 rounded-xs px-6 text-label-sm uppercase',
        outline: 'h-12 rounded-xs border border-red-burgundy px-6 text-label-sm uppercase',
        light: 'h-12 rounded-xs px-6 text-label-sm uppercase',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: { variant: 'primary', fullWidth: false },
  },
)

export type ButtonVariant = NonNullable<VariantProps<typeof buttonShape>['variant']>

/** Cores de cada variante, com o hover só quando o botão está habilitado. */
export const buttonTone: Record<ButtonVariant, string> = {
  primary: 'bg-red-ruby text-white enabled:hover:bg-red-burgundy',
  secondary: 'bg-rose-dusty text-brown-espresso enabled:hover:bg-rose-vintage',
  compact: 'bg-rose-vintage text-gray-ink enabled:hover:bg-rose-dusty',
  danger: 'bg-rose-dusty text-brown-espresso enabled:hover:bg-rose-vintage',
  pill: 'bg-red-ruby text-white enabled:hover:bg-red-burgundy',
  solid: 'bg-red-burgundy text-white enabled:hover:bg-red-ruby',
  outline: 'text-red-burgundy enabled:hover:bg-red-burgundy enabled:hover:text-white',
  light: 'bg-beige-sand text-red-burgundy enabled:hover:bg-white',
}

/** Desabilitado fica bege acinzentado com texto tinta, bem diferente de um botão ativo. */
export const buttonDisabledTone = 'bg-beige-sand text-gray-ink opacity-60'

/**
 * Hover do botão em forma de link (`ButtonLink`): um link não tem o estado `enabled`,
 * então a cor de hover vem sem o prefixo.
 */
export const linkTone: Record<ButtonVariant, string> = {
  primary: 'bg-red-ruby text-white hover:bg-red-burgundy',
  secondary: 'bg-rose-dusty text-brown-espresso hover:bg-rose-vintage',
  compact: 'bg-rose-vintage text-gray-ink hover:bg-rose-dusty',
  danger: 'bg-rose-dusty text-brown-espresso hover:bg-rose-vintage',
  pill: 'bg-red-ruby text-white hover:bg-red-burgundy',
  solid: 'bg-red-burgundy text-white hover:bg-red-ruby',
  outline: 'text-red-burgundy hover:bg-red-burgundy hover:text-white',
  light: 'bg-beige-sand text-red-burgundy hover:bg-white',
}
