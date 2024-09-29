import React, { useState, useEffect } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

const images = [
    '/images/th.jpeg',
    '/images/image2.jpg',
    '/images/image3.jpg',
    '/images/image4.jpg'
  ];


export default function TravelHero() {
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const navigate = (direction) => {
    setCurrentImage((prev) => {
      if (direction === 'up') {
        return prev === 0 ? images.length - 1 : prev - 1
      } else {
        return (prev + 1) % images.length
      }
    })
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {images.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentImage ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img src={src} alt={`Travel destination ${index + 1}`} className="h-full w-full object-cover" />
        </div>
      ))}
      <div className="absolute inset-0 bg-black bg-opacity-40">
        <div className="container mx-auto h-full px-4">
         
          <div className="flex h-[calc(100%-5rem)] flex-col justify-between">
            <div className="mt-20 max-w-2xl">
              <h1 className="mb-4 text-5xl font-bold text-white">Start your unforgettable journey with us.</h1>
              <p className="text-xl text-white">The best travel for your journey begins now</p>
            </div>
            {/* <div className="mb-8 flex items-end">
              <div className="grid w-full max-w-4xl grid-cols-5 gap-4 rounded-lg bg-white p-4">
                <input
                  type="text"
                  placeholder="Destination"
                  className="col-span-2 rounded border p-2"
                />
                <input
                  type="number"
                  placeholder="Person"
                  className="col-span-1 rounded border p-2"
                />
                <input
                  type="date"
                  placeholder="Check in"
                  className="col-span-1 rounded border p-2"
                />
                <button className="col-span-1 rounded bg-orange-500 p-2 text-white hover:bg-orange-600">
                  Book Now
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 space-y-2">
        <button
          onClick={() => navigate('up')}
          className="rounded-full bg-white p-2 text-black hover:bg-gray-200"
        >
          <ChevronUp size={24} />
        </button>
        {images.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full ${
              index === currentImage ? 'bg-white' : 'bg-gray-400'
            }`}
          />
        ))}
        <button
          onClick={() => navigate('down')}
          className="rounded-full bg-white p-2 text-black hover:bg-gray-200"
        >
          <ChevronDown size={24} />
        </button>
      </div>
    </div>
  )
}