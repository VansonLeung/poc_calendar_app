import PropTypes from 'prop-types'
import { cn } from '../../utils/cn'

export const Label = ({ className, ...props }) => {
  return (
    <label
      className={cn('text-sm font-medium text-slate-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
      {...props}
    />
  )
}

Label.propTypes = {
  className: PropTypes.string,
}

export default Label
