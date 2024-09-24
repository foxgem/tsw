import React from 'react'

interface IconProps {
  children: React.ReactNode
}

export default function TSWIcon({ children }: IconProps) {
  return (
    <div className="w-9 h-9 hover:bg-accent rounded-full flex items-center justify-center cursor-pointer">
      {children}
    </div>
  )
}