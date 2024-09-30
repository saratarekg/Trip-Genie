import line1 from "../assets/images/line-1.svg";
import rating from "../assets/images/rating.svg";

export const ItineraryCards = () => {
  return (
    <div className="flex items-center gap-[100px] pl-[182px] pr-0 py-[140px] relative">
      <div className="inline-flex items-center gap-8 relative flex-[0_0_auto]">
        <div className="inline-flex flex-col items-center justify-center gap-8 relative flex-[0_0_auto]">
          <div className="inline-flex flex-col items-start gap-5 relative flex-[0_0_auto]">
            <div className="relative w-fit mt-[-1.00px] [font-family:'Playfair_Display-Regular',Helvetica] font-normal text-[#172432] text-[64px] tracking-[0] leading-[normal]">
            Itineraries
            </div>
            <img className="relative w-[231px] h-[3px]" alt="Line" src={line1} />
          </div>
          <p className="relative self-stretch [font-family:'Rubik-Regular',Helvetica] font-normal text-[#767e86] text-lg tracking-[0] leading-[normal]">
            20 years from now you will be more disappointed by the things that you didn’t do. Stop regretting and start
            travelling, start throwing off the bowlines.
          </p>
          <div className="top-[305px] left-[201px] bg-[#767e86] absolute w-[43px] h-[43px]" />
          <div className="top-64 left-[26px] bg-[#172432] absolute w-[43px] h-[43px]" />
          <button className="all-[unset] box-border inline-flex items-center justify-center p-5 absolute top-[271px] left-10 bg-[#ff7757] rounded-xl">
            <div className="relative w-fit mt-[-1.00px] [font-family:'Rubik-Regular',Helvetica] font-normal text-white text-lg tracking-[0] leading-[normal] whitespace-nowrap">
              View all trip plans
            </div>
          </button>
        </div>
      </div>
      <div className="flex items-center gap-8 relative flex-1 grow">
        <div className="relative w-[300px] h-[399px] bg-[#00000033] rounded-[26px] bg-[url(/image-container.png)] bg-cover bg-[50%_50%]" />
        <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
          <div className="relative w-[300px] h-[399px] bg-[#00000033] rounded-[26px] bg-[url(/col-block.png)] bg-cover bg-[50%_50%]" />
          <div className="flex flex-col items-start justify-end gap-3 px-0 py-5 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex items-start justify-between relative self-stretch w-full flex-[0_0_auto]">
              <div className="relative w-fit mt-[-1.00px] [font-family:'Rubik-Regular',Helvetica] font-normal text-[#172432] text-lg tracking-[0] leading-[normal] whitespace-nowrap">
                GUIDED TOUR
              </div>
              <div className="relative w-fit mt-[-1.00px] [font-family:'Rubik-Regular',Helvetica] font-normal text-[#172432] text-lg tracking-[0] leading-[normal] whitespace-nowrap">
                €99/Day
              </div>
            </div>
            <div className="relative w-fit [font-family:'Playfair_Display-SemiBold',Helvetica] font-semibold text-[#172432] text-[28px] tracking-[0] leading-[normal]">
              Paris City Tour
            </div>
            <div className="flex items-start justify-between relative self-stretch w-full flex-[0_0_auto]">
              <img className="relative flex-[0_0_auto]" alt="Rating" src={rating} />
              <div className="relative w-fit mt-[-1.00px] [font-family:'Rubik-Regular',Helvetica] font-normal text-[#172432] text-lg tracking-[0] leading-[normal] whitespace-nowrap">
                7 Days tour
              </div>
            </div>
          </div>
        </div>
        <div className="relative w-[300px] h-[399px] bg-[#00000033] rounded-[26px] bg-[url(/image.png)] bg-cover bg-[50%_50%]" />
        <div className="relative w-[300px] h-[399px] mr-[-52.00px] bg-[#00000033] rounded-[26px] bg-[url(/image-container-2.png)] bg-cover bg-[50%_50%]" />
      </div>
    </div>
  );
};
