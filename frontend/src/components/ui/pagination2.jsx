import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  className,
}) {
  const [hoveredPage, setHoveredPage] = useState(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: '0%',
    width: '0%'
  });

  useEffect(() => {
    const activeIndex = currentPage - 1;
    const position = (activeIndex * 100) / totalPages;
    const width = 100 / totalPages;

    setIndicatorStyle({
      left: `${position}%`,
      width: `${width}%`
    });
  }, [currentPage, totalPages]);

  const handleHover = (page) => {
    setHoveredPage(page);
    const position = ((page - 1) * 100) / totalPages;
    const width = 100 / totalPages;
    setIndicatorStyle({
      left: `${position}%`,
      width: `${width}%`
    });
  };

  const handleHoverEnd = () => {
    setHoveredPage(null);
    const position = ((currentPage - 1) * 100) / totalPages;
    const width = 100 / totalPages;
    setIndicatorStyle({
      left: `${position}%`,
      width: `${width}%`
    });
  };

  return (
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      <div className="flex items-center justify-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
        
        <div className="relative flex items-center">
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                onMouseEnter={() => handleHover(page)}
                onMouseLeave={handleHoverEnd}
                className={cn(
                  "relative h-10 w-10 text-sm transition-colors",
                  currentPage === page ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                {page}
              </button>
            ))}
          </div>
          {/* Animated underline indicator */}
          <div
            className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-in-out"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
          />
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </div>
  );
}

