'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

export function CoolButton() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    (<button
      className="group relative overflow-hidden rounded-full bg-[#702963] px-6 py-3 text-white transition-all duration-300 hover:bg-[#8a3a7a] focus:outline-none focus:ring-2 focus:ring-[#702963] focus:ring-offset-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <span className="relative z-10 font-semibold">
        Click Me
        <ChevronRight
          className={`ml-2 inline-block transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
      </span>
      <span
        className="absolute inset-0 z-0 scale-x-0 rounded-full bg-white opacity-25 transition-transform duration-300 group-hover:scale-x-100" />
    </button>)
  );
}