import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import Cookies from "js-cookie";
import axios from "axios";
import firstGenie from "@/assets/images/first-genie.png";
import secondGenie from "@/assets/images/second-genie.png";

export const UserGuide = ({ steps, onStepChange, pageName }) => {
  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [shouldShowGenie, setShouldShowGenie] = useState(false);

  useEffect(() => {
    const userCluster = localStorage.getItem("cluster");
    const specialClusters = ["1-0", "1-1", "3-0"]; // Clusters that should see genie
    
    // Only show genie for special clusters
    if (specialClusters.includes(userCluster)) {
      setShouldShowGenie(true);
      setRunTour(true); // Show immediately on login
    } else {
      // All other clusters never see the genie
      setShouldShowGenie(false);
    }
  }, []);

  const handleJoyrideCallback = (data) => {
    const { action, index, type, status } = data;

    if (type === "step:after" || type === "tooltip") {
      if (action === "prev") {
        setStepIndex(Math.max(0, index - 1));
      } else if (action === "next") {
        setStepIndex(Math.min(steps.length - 1, index + 1));
      }
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      setStepIndex(0);
    }
  };

  const startTour = () => {
    setRunTour(true);
    setStepIndex(0);
  };

  if (!shouldShowGenie) {
    return null; // Hide completely for non-special clusters
  }

  return (
    <>
      {!runTour && (
        <div className="fixed bottom-4 right-4 z-10">
          <Button
            onClick={startTour}
            className="w-10 h-10 rounded-full bg-[#388A94] text-white hover:bg-[#1A3B47] p-0"
            aria-label="Take a Tour"
          >
            <HelpCircle className="w-6 h-6" />
          </Button>
        </div>
      )}
      <Joyride
        steps={steps}
        run={runTour}
        stepIndex={stepIndex}
        continuous={true}
        disableOverlayClose={true}
        showSkipButton={true}
        showProgress={true}
        scrollToFirstStep={true}
        scrollOffset={100}
        callback={handleJoyrideCallback}
        tooltipComponent={(props) => (
          <TooltipComponent 
            {...props} 
            steps={steps} 
            firstGenie={firstGenie}
            secondGenie={secondGenie}
          />
        )}
      />
    </>
  );
};

// Tooltip Component
const TooltipComponent = ({
  backProps,
  primaryProps,
  skipProps,
  step,
  index,
  isLastStep,
  steps,
  firstGenie,
  secondGenie
}) => {
  const totalSteps = steps.length;
  const isEvenStep = index % 2 === 0;
  const isPlacedLeft = step.placement === "left";
  const isPlacedRight = step.placement === "right";
  
  let genieOnLeft = isPlacedLeft || isEvenStep;
  if (isPlacedRight) genieOnLeft = false;
  if (step.genieOrientation === "right") genieOnLeft = false;
  if (step.genieOrientation === "left") genieOnLeft = true;

  return (
    <div style={{ position: "relative", zIndex: 10000 }}>
      <div style={{
        backgroundColor: "#fff",
        borderRadius: "8px",
        padding: "20px",
        color: "#1A3B47",
        maxWidth: "400px",
        position: "relative",
        marginLeft: genieOnLeft ? "120px" : "0",
        marginRight: genieOnLeft ? "0" : "120px",
      }}>
        <p style={{
          fontSize: "14px",
          color: "#777",
          margin: "0 0 8px",
          fontWeight: "bold",
          textAlign: "center",
        }}>
          Step {index + 1} of {totalSteps}
        </p>

        <h4 style={{
          margin: "0 0 12px",
          fontSize: "18px",
          color: "#1A3B47",
          fontWeight: "bold",
        }}>
          {step.title}
        </h4>
        
        <p style={{
          margin: 0,
          fontSize: "16px",
          color: "#555",
          lineHeight: "1.5",
        }}>
          {step.content}
        </p>

        <div style={{
          marginTop: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <button
            {...skipProps}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              backgroundColor: "#388A94",
              color: "#fff",
              cursor: "pointer",
              transition: "background-color 0.2s ease-in-out",
              fontWeight: "bold",
              marginRight: "auto",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#2e6b77")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#388A94")}
          >
            Got it!
          </button>

          {index > 0 && (
            <button
              {...backProps}
              style={{
                padding: "8px 0px",
                border: "none",
                borderRadius: "4px",
                fontWeight: "bold",
                color: "#666",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#444")}
              onMouseLeave={(e) => (e.target.style.color = "#666")}
            >
              Prev
            </button>
          )}

          <button
            {...primaryProps}
            style={{
              padding: "8px 8px",
              border: "none",
              backgroundColor: "#fff",
              color: "#388A94",
              fontWeight: "bold",
              cursor: "pointer",
              marginLeft: "12px",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#2e6b77")}
            onMouseLeave={(e) => (e.target.style.color = "#388A94")}
          >
            {isLastStep ? "Finish" : "Next"}
          </button>
        </div>
      </div>
      
      <div style={{
        position: "absolute",
        left: genieOnLeft ? "-50px" : "auto",
        right: genieOnLeft ? "auto" : "-50px",
        top: "0%",
        transform: "translateY(-50%)",
      }} className="animate-float">
        <img
          src={genieOnLeft ? firstGenie : secondGenie}
          alt="Character"
          style={{ width: "160px", height: "160px" }}
        />
      </div>
    </div>
  );
};