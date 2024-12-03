import React, { useState, useEffect } from 'react';

const AllPromoCodes = () => {
  const [loading, setLoading] = useState(true);
  const [promoCodes, setPromoCodes] = useState([]);

  useEffect(() => {
    // Simulate an API call
    setTimeout(() => {
      setPromoCodes([
        // ...sample promo codes...
      ]);
      setLoading(false);
    }, 1000); // Match the loading time with notifications
  }, []);

  if (loading) {
    return (
      <div>
        <div className="animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 p-4 animate-pulse bg-gray-200">
              <div className="w-12 h-12 bg-gray-300 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="w-full h-4 bg-gray-300 rounded-md" />
                <div className="w-3/4 h-4 bg-gray-300 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {promoCodes.map((code, index) => (
        <div key={index}>
          {/* Render promo code details */}
        </div>
      ))}
    </div>
  );
};

export { AllPromoCodes };
