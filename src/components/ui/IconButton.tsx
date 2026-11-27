import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { iconButtonStyles, type IconButtonStyleProps } from './iconButtonStyles'

type CommonProps = IconButtonStyleProps & {
  /** Nome da ação para leitores de tela (obrigatório: o botão não tem texto). */
  label: string
  /** O ícone, do lucide-react, com `aria-hidden="true"`. */
  children: ReactNode
}

type IconButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children' | 'className'>

/** Botão só com ícone. */
export function IconButton({
  label,
  variant,
  size,
  shape,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={iconButtonStyles({ variant, size, shape })}
      {...rest}
    />
  )
}

type IconButtonLinkProps = CommonProps & Omit<LinkProps, 'aria-label' | 'children' | 'className'>

/** Link com a aparência de um botão de ícone (quando a ação é ir para outra página). */
export function IconButtonLink({ label, variant, size, shape, ...rest }: IconButtonLinkProps) {
  return (
    <Link aria-label={label} className={iconButtonStyles({ variant, size, shape })} {...rest} />
  )
}
