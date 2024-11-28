import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import Cookies from "js-cookie";
import axios from "axios";
import { forceVisible } from "react-lazyload";

export const UserGuide = ({ steps, onStepChange, pageName }) => {
  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Check if the page is visited
  useEffect(() => {
    const checkAndTriggerTour = async () => {
      let visitedPages = [];
      const token = Cookies.get("jwt");

      if (token) {
        // Fetch visited pages from the backend
        const response = await axios.get(
          "http://localhost:4000/tourist/visited-pages",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        visitedPages = response.data.visitedPages;
      } else {
        // For guests, retrieve from local storage
        const storedPages = localStorage.getItem("visitedPages");
        visitedPages = storedPages ? JSON.parse(storedPages) : [];
      }

      if (!visitedPages.includes(pageName)) {
        setRunTour(true); // Start the Joyride
        visitedPages.push(pageName);

        // Update visited pages
        if (token) {
          await axios.post(
            `http://localhost:4000/tourist/visited-pages`,
            {
              visitedPages,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        } else {
          localStorage.setItem("visitedPages", JSON.stringify(visitedPages));
        }
      }
    };

    checkAndTriggerTour();
  }, [pageName]);

  const handleJoyrideCallback = (data) => {
    const { status, index, type, action } = data;

    if (type === "step:before") {
      if (onStepChange) {
        onStepChange(index + 1);
      }
    }

    if (type === "step:after") {
      if (action === "prev") {
        setStepIndex(index - 1);
      } else {
        setStepIndex(index + 1);
      }
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
        callback={handleJoyrideCallback}
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
            visibility: "hidden",
          },
          buttonBack: {
            marginRight: 10, // Fix Back button alignment
            color: stepIndex === 0 ? "rgba(0, 0, 0, 0.3)" : "#388A94", // Disable on first step
            pointerEvents: stepIndex === 0 ? "none" : "auto", // Make non-clickable on the first step
          },
        }}
      />
    </>
  );
};
