import { Quote } from "lucide-react";

export function TestimonialBannerJsx() {
  const testimonials = [
    {
      quote: "The local experiences they arranged were truly unique. It felt like we discovered hidden gems!",
      author: "Sophie Dubois",
      location: "Paris, France",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&auto=format&q=80",
    },
    {
      quote:
        "I've never had such a seamless travel experience. Every aspect of our trip was perfectly planned.",
      author: "Marco Rossi",
      location: "Rome, Italy",
      image:
        "https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=150&h=150&fit=crop&auto=format&q=80",
    },
    {
      quote:
        "From booking to return, everything was handled professionally. I can't wait for my next adventure with them!",
      author: "Emily Chen",
      location: "Vancouver, Canada",
      image:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=150&h=150&fit=crop&auto=format&q=80",
    },
  ];

  return (
    <section className="relative overflow-hidden py-12 -mt-28 mb-8 w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw]">
      <div className="absolute inset-0 pointer-events-none" />
      <div className="relative container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1A3B47] mb-12">
          What Our Travelers Say
        </h2>
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 w-full max-w-6xl">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`
                flex-1 bg-white/80 backdrop-blur-md p-6 text-[#1A3B47] shadow-xl transition-all duration-300 hover:bg-white/90 hover:shadow-2xl
                ${
                  index === 0
                    ? "rounded-tl-3xl rounded-br-3xl"
                    : index === 1
                    ? "rounded-3xl"
                    : "rounded-tr-3xl rounded-bl-3xl"
                }
              `}
            >
              <div className="flex items-center mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden mr-3 ring-2 ring-[#F88C33]">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">
                    {testimonial.author}
                  </h3>
                  <p className="text-xs text-[#5D9297]">
                    {testimonial.location}
                  </p>
                </div>
              </div>
              <Quote className="h-6 w-6 text-[#F88C33] mb-2 opacity-50" />
              <blockquote className="text-sm italic">
                {testimonial.quote}
              </blockquote>
            </div>
          ))}
        </div>
        {/* <div className="mt-12 text-center">
          <button className="px-8 py-3 text-white font-bold rounded-full shadow-lg transition duration-300 ease-in-out transform hover:bg-teal-700 bg-orange-500 hover:scale-105">
            Start Your
          </button>
        </div> */}
      </div>
      <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-[#F88C33] opacity-60 mt-12 ml-28" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-[#F88C33] opacity-60 mb-8 mr-28" />
    </section>
  );
}
