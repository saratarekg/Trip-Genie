import React from 'react'

const Loader = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
      <svg className="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
        <circle className="path" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
      </svg>

      <style jsx>{`
        .spinner {
          animation: rotator 1.4s linear infinite;
        }

        @keyframes rotator {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(270deg); }
        }

        .path {
          stroke-dasharray: 187;
          stroke-dashoffset: 0;
          transform-origin: center;
          animation: dash 1.4s ease-in-out infinite, colors 5.6s ease-in-out infinite;
        }

        @keyframes colors {
          0% { stroke: #3B82F6; }
          25% { stroke: #EF4444; }
          50% { stroke: #F59E0B; }
          75% { stroke: #10B981; }
          100% { stroke: #3B82F6; }
        }

        @keyframes dash {
          0% { stroke-dashoffset: 187; }
          50% {
            stroke-dashoffset: 46.75;
            transform: rotate(135deg);
          }
          100% {
            stroke-dashoffset: 187;
            transform: rotate(450deg);
          }
        }
      `}</style>
    </div>

  );

export default Loader
