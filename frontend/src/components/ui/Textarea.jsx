import { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { cn } from '../../utils/cn'

export const Textarea = forwardRef(({ className, rows = 4, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  )
})

Textarea.displayName = 'Textarea'

Textarea.propTypes = {
  className: PropTypes.string,
  rows: PropTypes.number,
}

export default Textarea
