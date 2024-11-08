import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, ZoomOut } from "lucide-react";

const Modal = ({
  show,
  onClose,
  children,
  isImageViewer = false,
  imageUrl = "",
}) => {
  const [scale, setScale] = useState(1);
  //   const [panning, setPanning] = useState(false);
  //   const [position, setPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  useEffect(() => {
    if (isImageViewer && imageRef.current) {
      const img = imageRef.current;
      const containerAspectRatio = window.innerWidth / window.innerHeight;
      const imageAspectRatio = img.naturalWidth / img.naturalHeight;

      if (imageAspectRatio > containerAspectRatio) {
        img.style.width = "90vw";
        img.style.height = "auto";
      } else {
        img.style.height = "90vh";
        img.style.width = "auto";
      }
    }
  }, [isImageViewer, imageUrl]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(0.1, scale + delta), 10);
    setScale(newScale);
  };

  //   const handleMouseDown = (e) => {
  //     setPanning(true);
  //     setPosition({
  //       x: e.clientX - position.x,
  //       y: e.clientY - position.y,
  //     });
  //   };

  //   const handleMouseUp = () => {
  //     setPanning(false);
  //   };

  //   const handleMouseMove = (e) => {
  //     if (panning) {
  //       setPosition({
  //         x: e.clientX - position.x,
  //         y: e.clientY - position.y,
  //       });
  //     }
  //   };

  const handleZoomIn = () => {
    setScale(Math.min(scale + 0.1, 10));
  };

  const handleZoomOut = () => {
    setScale(Math.max(scale - 0.1, 0.1));
  };

  if (!show) return null;

  if (isImageViewer) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center overflow-hidden">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-6 w-6" />
            <span className="sr-only">Zoom in</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-6 w-6" />
            <span className="sr-only">Zoom out</span>
          </Button>
        </div>
        <div
          className="w-full h-full flex items-center justify-center overflow-hidden"
          onWheel={handleWheel}
          //   onMouseDown={handleMouseDown}
          //   onMouseUp={handleMouseUp}
          //   onMouseLeave={handleMouseUp}
          //   onMouseMove={handleMouseMove}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Full screen view"
            className="max-w-none max-h-none object-contain transition-transform duration-200 ease-out"
            style={{
              //   transform: `scale(${scale}) translate(${position.x / scale}px, ${
              //     position.y / scale
              //   }px)`,
              transform: `scale(${scale})`,
            }}
            // draggable="false"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 xl:w-1/3 max-h-[90vh] overflow-auto">
        <div className="p-6 relative">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
};

export { Modal };
