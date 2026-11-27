import { cva, type VariantProps } from 'class-variance-authority'
import { focusRing } from './focus'

/** Estilo dos botões que têm só um ícone. */
export const iconButtonStyles = cva(
  `inline-flex shrink-0 items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`,
  {
    variants: {
      variant: {
        /** Destaque em Rubi (notificações). */
        brand: 'bg-red-ruby text-white shadow-md hover:bg-red-burgundy',
        /** Branco com sombra (setas sobre o fundo da página). */
        surface: 'bg-white text-red-ruby shadow-md hover:bg-beige-light',
        /** Sem fundo (fechar janelas). */
        ghost: 'text-gray-dim hover:bg-beige-light',
      },
      size: {
        sm: 'size-8',
        /** Do tamanho do avatar (40 px no desktop); 44 px no celular, o mínimo para o toque. */
        md: 'size-11 lg:size-10',
        lg: 'size-12',
      },
      shape: {
        square: 'rounded-xs',
        round: 'rounded-full',
      },
    },
    defaultVariants: { variant: 'surface', size: 'lg', shape: 'square' },
  },
)

export type IconButtonStyleProps = VariantProps<typeof iconButtonStyles>
