'use client';
import React from 'react'
import { Building2, FileText, LandPlot, DollarSign, Award } from 'lucide-react'

const iconMap = {
  building: Building2,
  file: FileText,
  bank: LandPlot,
  money: DollarSign,
  award: Award,
}

const colorMap = {
  building: 'bg-orange-500',
  file: 'bg-cyan-500',
  bank: 'bg-lime-500',
  money: 'bg-yellow-500',
  award: 'bg-red-500',
}

function Timeline({
  items
}) {
  return (
    (<div className="container mx-auto p-4">
      <div
        className="flex flex-col md:flex-row justify-between items-center relative">
        {items.map((item, index) => (
          <div
            key={item.year}
            className="flex flex-col items-center mb-8 md:mb-0 relative">
            <div className={`rounded-full p-4 ${colorMap[item.icon]} text-white mb-2`}>
              {React.createElement(iconMap[item.icon], { size: 32 })}
            </div>
            <div className="text-2xl font-bold">{item.year}</div>
            <h3
              className={`text-lg font-semibold mt-2 ${colorMap[item.icon].replace('bg-', 'text-')}`}>
              {item.title}
            </h3>
            <p className="text-sm text-gray-600 text-center mt-1 max-w-[200px]">{item.description}</p>
            {index < items.length - 1 && (
              <div className="hidden md:block absolute top-1/2 left-full w-full">
                <div
                  className="w-full h-1 bg-gray-300 absolute top-0 left-0"
                  style={{ zIndex: -1 }}></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>)
  );
}

export function TimelinePreviewComponent() {
  const timelineItems = [
    {
      year: "10am -11am",
      title: "Project Initiation",
      description: "Kickoff of the major development project.",
      icon: "building"
    },
    {
      year: "2pm -3pm",
      title: "Planning Phase",
      description: "Detailed project planning and resource allocation.",
      icon: "file"
    },
    {
      year: "4pm -5pm",
      title: "Implementation",
      description: "Main phase of project implementation and development.",
      icon: "bank"
    },
    {
      year: "6pm -7pm",
      title: "Financial Review",
      description: "Comprehensive financial analysis and reporting.",
      icon: "money"
    },
    {
      year: "9pm -11pm",
      title: "Project Completion",
      description: "Successful completion and final project evaluation.",
      icon: "award"
    }
  ];

  return (
    (<div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-8">Itinerary Timeline</h2>
      <Timeline items={timelineItems} />
    </div>)
  );
}