import clsx from 'clsx';
export default function Badge({ children, className }) {
  return <span className={clsx('badge', className || 'bg-gray-100 text-gray-800')}>{children}</span>;
}
