import React, { useState } from 'react'
import { Range, getTrackBackground } from 'react-range'

export function DualHandleSliderComponent({
  min = 0,
  max = 1000,
  step = 20,
  initialValues = [0, 1000],
  onChange
}) {
  const [values, setValues] = useState(initialValues)

  const handleChange = (newValues) => {
    const [newMin, newMax] = newValues
    setValues([newMin, newMax])
    if (onChange) {
      onChange([newMin, newMax])
    }
  }

  return (
    (<div className="w-full px-4 py-8">
      <Range
        values={values}
        step={step}
        min={min}
        max={max}
        onChange={handleChange}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            className="w-full h-3 pr-2 my-4 bg-gray-200 rounded-md"
            style={{
              background: getTrackBackground({
                values,
                colors: ["#ccc", "#3b82f6", "#ccc"],
                min,
                max,
              }),
            }}>
            {children}
          </div>
        )}
        renderThumb={({ props, isDragged }) => (
          <div
            {...props}
            className={`w-5 h-5 transform translate-x-10 bg-white rounded-full shadow flex items-center justify-center ${
              isDragged ? "ring-2 ring-blue-500" : ""
            }`}>
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
          </div>
        )} />
      <div className="flex justify-between mt-2">
        <span className="text-sm font-medium text-gray-700">Min: {values[0]}</span>
        <span className="text-sm font-medium text-gray-700">Max: {values[1]}</span>
      </div>
    </div>)
  );
}