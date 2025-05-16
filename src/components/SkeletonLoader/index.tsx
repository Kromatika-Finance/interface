// src/components/SkeletonLoader.tsx
import React from 'react'

type SkeletonType = 'card' | 'chart' | 'list'

export default function SkeletonLoader({ type }: { type: SkeletonType }) {
  let className = 'bg-gray-200 animate-pulse rounded'

  switch (type) {
    case 'card':
      className += ' w-full h-48 mb-4'
      break
    case 'chart':
      className += ' w-full h-64 mb-4'
      break
    case 'list':
      className += ' w-full h-32 mb-4'
      break
    default:
      className += ' w-full h-24'
  }

  return <div className={className} />
}
