import React from "react";
import { InfoBox } from "../components/InfoBox";
import { UShop1 } from "../components/UShop1";
import { UShoppingBag } from "../components/UShoppingBag";
import { UUsersAlt } from "../components/UUsersAlt";
import frame1618 from "../assets/images/frame-1618.svg";
import frame from "../assets/images/frame.svg";
import image15 from "../assets/images/image-15.png";
import logo from "../assets/images/logo.svg";
import svgrepoIconcarrier from "../assets/images/svgrepo-iconcarrier.png";
import { AdminGovernorPopup } from "@/components/admin-governor-popup";

export const AdminDash = () => {
    return (
      <div className="w-full min-h-screen bg-white pt-[80px] pb-20 flex flex-col"> {/* Ensure flex column layout */}
        <div className="flex-grow"> {/* This makes the main content area grow to fill available space */}
          <div
            className="absolute w-full h-[2256px] top-0 left-0"
            alt="Image"
            src={image15}
          />
          <div className="flex flex-col w-full items-center gap-[58px]">
            <p className="self-stretch [font-family:'Rubik-Medium',Helvetica] font-medium text-black text-[40px] text-center tracking-[0] leading-[normal]">
              Welcome to your Dashboard Genie!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-[150px_80px] px-20 py-[150px] relative w-full">
              {/* Accounts Section */}
              <div className="flex flex-col w-[1030px] h-[475px] items-center justify-center gap-[52px] p-[52px] bg-[#ed8936cc] rounded-[70px]">
                <div className="flex flex-col w-[305px] h-[101px] mt-[-6.50px]">
                  <div className="flex flex-col w-full h-full items-start gap-2.5 px-11 py-6 bg-white rounded-[60px]">
                    <div className="flex w-[204px] items-center gap-[15px]">
                      <img
                        className="relative w-[24.96px] h-[25.59px]"
                        alt="Svgrepo iconcarrier"
                        src={svgrepoIconcarrier}
                      />
                      <div className="font-semibold text-black text-[35px] text-center">
                        Accounts
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex w-full justify-between">
                  <ActionButton title="Review Registrations" />
                  <ActionButton title="Manage Accounts" />
                  <AdminGovernorPopup  />
                  </div>
              </div>

              {/* Activities Section */}
              <div className="flex flex-col w-[599px] h-[487px] items-center justify-center gap-[52px] p-[52px] bg-[#003f66cc] rounded-[40px]">
                <div className="flex flex-col w-[305px] h-[101px] items-center justify-center gap-2.5 px-[60px] py-[11px] bg-white rounded-[60px]">
                  <div className="inline-flex items-center justify-center gap-[15px] px-3.5 py-2.5">
                    <img
                      className="relative w-6 h-[38.4px]"
                      alt="Svgrepo iconcarrier"
                      src={image15}
                    />
                    <div className="font-semibold text-black text-[35px] text-center">
                      Activities
                    </div>
                  </div>
                </div>
                <div className="flex w-full justify-between">
                  <ActionButton title="Manage Categories" />
                  <ActionButton title="Manage Activities" />
                </div>
              </div>

              {/* Gift Shop Section */}
              <div className="flex flex-col w-[599px] h-[487px] items-center justify-center gap-[52px] p-[52px] bg-[#003f66cc] rounded-[40px]">
                <div className="flex flex-col w-[305px] h-[101px] items-center justify-center gap-2.5 px-[60px] py-[11px] bg-white rounded-[60px]">
                  <div className="inline-flex flex-col items-center justify-center gap-[15px]">
                    <div className="relative w-[229px] h-[73px]">
                      <div className="inline-flex items-center justify-center gap-2.5 p-2.5">
                        <img
                          className="relative w-[37px] h-[37px]"
                          alt="Frame"
                          src={frame}
                        />
                        <div className="font-semibold text-black text-[35px] text-center">
                          Gift Shop
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex w-full justify-between">
                  <ActionButton title="Manage Products" />
                  <ActionButton title="Create Promo Code" />
                </div>
              </div>

              {/* Graph and Info Boxes Section */}
              <div className="flex flex-wrap w-[1002px] items-center justify-center gap-[52px_52px] p-[52px] bg-[#ed8936cc] rounded-[40px]">
                <GraphCard title="Graph" />
                <GraphCard title="Graph" />
                <div className="flex w-[870px] items-start gap-5">
                  <InfoBox text="Total Sales" text1="$2,456" icon={<UShoppingBag className="w-[45px] h-[45px]" color="#EA580C" />} />
                  <InfoBox text="Total Expenses" text1="$3,326" icon={<UShop1 className="w-[45px] h-[45px]" color="#7C3AED" />} />
                  <InfoBox text="Total Visitors" text1="5,325" icon={<UUsersAlt className="w-[45px] h-[45px]" color="#059669" />} />
                  <InfoBox text="This Month’s Visitors" text1="1,230" icon={<UUsersAlt className="w-[45px] h-[45px]" color="#ED8C8C" />} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

// Helper ActionButton Component
const ActionButton = ({ title }) => (
  <div className="relative w-60 h-[230px]">
    <button className="w-full h-full bg-white rounded-[40px] transition-transform transform hover:scale-105 focus:outline-none">
      <div className="absolute top-1/2 transform -translate-y-1/2 w-full [font-family:'Rubik-Medium',Helvetica] font-medium text-black text-[32px] text-center tracking-[0] leading-[38.0px]">
        {title}
      </div>
    </button>
  </div>
);

// Helper GraphCard Component
const GraphCard = ({ title }) => (
  <div className="relative w-[354px] h-[225px]">
    <div className="relative w-[352px] h-[225px]">
      <div className="w-[340px] h-[225px] bg-[#d9d9d9] rounded-[40px]" />
      <div className="absolute w-[352px] top-[78px] left-0 [font-family:'Rubik-Medium',Helvetica] font-medium text-black text-[32px] text-center tracking-[0] leading-[38.0px]">
        {title}
      </div>
    </div>
  </div>
);
