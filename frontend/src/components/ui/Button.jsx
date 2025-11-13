import { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { cn } from '../../utils/cn'

const buttonVariants = {
  default: 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:ring-blue-600',
  outline: 'border border-slate-300 text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-300',
  ghost: 'text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-300',
  destructive: 'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600',
}

const buttonSizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export const Button = forwardRef(({ className, variant = 'default', size = 'md', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed',
        buttonVariants[variant] || buttonVariants.default,
        buttonSizes[size] || buttonSizes.md,
        className,
      )}
      {...props}
    />
  )
})

Button.displayName = 'Button'

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(Object.keys(buttonVariants)),
  size: PropTypes.oneOf(Object.keys(buttonSizes)),
}

export default Button
