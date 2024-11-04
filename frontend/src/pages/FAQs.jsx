import React, { useState } from 'react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#B5D3D1]">
      <button
        className="w-full py-4 px-6 flex justify-between items-center hover:bg-[#E6DCCF]/10 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-[#1A3B47] text-left font-medium">{question}</span>
        <span className="text-[#388A94] text-2xl" aria-hidden="true">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      {isOpen && (
        <div 
          className="px-6 pb-4 text-[#1A3B47]/80"
          style={{ lineHeight: '1.6' }}
        >
          {answer}
        </div>
      )}
    </div>
  );
};

const FAQ = () => {
  const faqs = [
    {
      question: "How can I contact customer support?",
      answer: "You can reach our customer support team by emailing us at info@tripGenie.com. We're here to help you with any questions or concerns."
    },
    {
      question: "What is your cancellation policy for bookings?",
      answer: "Our cancellation policy depends on the activity or itinerary booked. You can find the specific cancellation terms on each product page. If you have questions, please contact us directly."
    },
    {
      question: "Will I get a refund if I cancel my booking?",
      answer: "Refunds vary based on the type of booking and the timing of your cancellation. Refer to our cancellation policy for detailed information, or contact our support team for assistance."
    },
    {
      question: "I want to change my account information",
      answer: "You can update your account information by logging into your account and navigating to the 'Account Settings' section."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email. You can use this number to track your package on our website."
    }
  ];

  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    // Optionally, you can add logic here to handle the search query
    // For now, it will just refresh the page
    window.location.reload(); // Refresh the page
  };

  return (
    <div className="min-h-screen bg-[#E6DCCF]/10">
      {/* Hero Section */}
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto px-4 py-12">
        {/* Left Column - Image */}
        <div className="relative h-[400px] bg-white rounded-2xl overflow-hidden shadow-lg">
          <img
            src="faq.jpg?height=400&width=600"
            className="w-full h-full object-cover"
            alt="Help Center"
          />
        </div>
        
        {/* Right Column - Help Center Header */}
        <div className="flex flex-col justify-center">
          <span className="text-[#F88C33] font-medium mb-2">Help center</span>
          <h1 className="text-4xl font-bold text-[#1A3B47] mb-4">
            How can We help You
          </h1>
          <p className="text-[#1A3B47]/70 mb-8">
            You can asking any questions you want to know and we will respond to you via email.
          </p>
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              placeholder="What can we help you with?"
              className="w-full px-4 py-3 rounded-lg border border-[#B5D3D1] focus:outline-none focus:ring-2 focus:ring-[#388A94] focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} // Update the input value
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#388A94] hover:bg-[#E6F1F2] p-2 rounded-full transition-colors"
              aria-label="Submit"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2 12l19-9-9 19-2-8-8-2z"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="divide-y divide-[#B5D3D1]">
            {faqs.map((faq, index) => (
              <FAQItem 
                key={index} 
                question={faq.question} 
                answer={faq.answer} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
