import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean
}

export function Card({ className = '', padding = true, children, ...props }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm ${padding ? 'p-6' : ''} ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`mb-4 ${className}`} {...props}>{children}</div>
}

export function CardTitle({ className = '', children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${className}`} {...props}>{children}</h3>
}
