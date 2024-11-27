import React, { useState } from "react";
import Joyride, { STATUS } from "react-joyride";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export const UserGuide = ({ steps, onStepChange }) => {
  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const handleJoyrideCallback = (data) => {
    const { status, index, type } = data;

    if (type === "step:before") {
      if (onStepChange) {
        onStepChange(index + 1);
      }
    }

    if (type === "step:after") {
      setStepIndex(index + 1);
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      setStepIndex(0); // Reset to the first step
    }
  };

  const startTour = () => {
    setRunTour(false); // Reset the tour state
    setTimeout(() => setRunTour(true), 100); // Restart the tour
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={startTour}
          className="w-10 h-10 rounded-full bg-[#388A94] text-white hover:bg-[#1A3B47] p-0"
          aria-label="Take a Tour"
        >
          <HelpCircle className="w-6 h-6" />
        </Button>
      </div>
      <Joyride
        steps={steps}
        run={runTour}
        continuous={true}
        disableOverlayClose={true} // Prevents closing the tour by clicking the overlay
        showSkipButton={true}
        showProgress={true}
        stepIndex={stepIndex}
        styles={{
          options: {
            primaryColor: "#388A94",
            textColor: "#1A3B47",
            zIndex: 10000,
          },
          spotlight: {
            borderRadius: "8px", // Make the spotlight smooth
            transition: "all 0.3s ease-in-out", // Smooth spotlight transitions
          },
          tooltip: {
            transition: "opacity 0.3s ease-in-out", // Smooth tooltip fade
          },
          close: {
            display: "none", // Remove the close (X) button
          },
          buttonBack: {
            marginRight: 10, // Fix Back button alignment
            color: stepIndex === 0 ? "rgba(0, 0, 0, 0.3)" : "#388A94", // Disable on first step
            pointerEvents: stepIndex === 0 ? "none" : "auto", // Make non-clickable on the first step
          },
        }}
        callback={handleJoyrideCallback}
      />
    </>
  );
};
