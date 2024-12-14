import PropTypes from "prop-types";
import React from "react";
import { UInfoCircle } from "./UInfoCircle"; // Ensure this path is correct based on your project structure

// InfoBox Component
export const InfoBox = ({
  className = "",
  icon = (
    <UInfoCircle className="!relative !w-[45px] !h-[45px]" color="#262626" />
  ),
  text = "Total sales",
  text1 = "$320 K",
  divClassName = "",
}) => {
  return (
    <div
      className={`flex w-[265px] items-start gap-2.5 p-5 relative bg-white rounded-[10px] ${className}`}
    >
      {icon}
      <div className="flex flex-col items-start relative flex-1 grow">
        <div
          className={`relative w-fit mt-[-1.00px] [font-family:'Poppins',Helvetica] font-light text-neutral-800 text-xs tracking-[0] leading-[normal] ${divClassName}`}
        >
          {text}
        </div>
        <div className="relative w-fit [font-family:'Poppins',Helvetica] font-semibold text-neutral-800 text-[22px] tracking-[0] leading-[normal]">
          {text1}
        </div>
      </div>
    </div>
  );
};

// PropTypes for InfoBox
InfoBox.propTypes = {
  text: PropTypes.string,
  text1: PropTypes.string,
  className: PropTypes.string,
  divClassName: PropTypes.string,
  icon: PropTypes.node, // To allow for any React node
};

// Storybook Configuration
export default {
  title: "Components/InfoBox",
  component: InfoBox,
};

// Default story
export const Default = {
  args: {
    className: "",
    text: "Total sales",
    text1: "$320 K",
    divClassName: "",
  },
};
