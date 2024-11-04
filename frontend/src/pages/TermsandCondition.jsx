import React, { useRef, useEffect } from 'react';


    const TermsAndConditions = () => {
        // Create refs for each section directly
        const sectionRefs = useRef({
          general: React.createRef(),
          acceptance: React.createRef(),
          eligibility: React.createRef(),
          license: React.createRef(),
          bookings: React.createRef(),
          obligations: React.createRef(),
          budgeting: React.createRef(),
          localInfo: React.createRef(),
          giftShop: React.createRef(),
          liability: React.createRef(),
          indemnification: React.createRef(),
          disputeResolution: React.createRef(),
          severability: React.createRef(),
          entireAgreement: React.createRef(),
          contact: React.createRef(),
        });

  const sections = {
    general: {
      title: "General Terms",
      content: "PLEASE READ THESE TERMS AND CONDITIONS CAREFULLY. BY ACCESSING OR USING THE TRIP GENIE APPLICATION , YOU, THE USER, EXPRESSLY ACKNOWLEDGE AND AGREE THAT YOU HAVE READ, UNDERSTAND, ACCEPT, AND AGREE TO BE BOUND BY THESE TERMS AND CONDITIONS. IF YOU DO NOT AGREE TO BE BOUND BY ALL OF THE TERMS OF THIS AGREEMENT, YOU MUST IMMEDIATELY CEASE USE OF THIS APPLICATION AND DELETE IT FROM YOUR DEVICE(S). FAILURE TO DO SO MAY RESULT IN UNAUTHORIZED USE OF THE SERVICES PROVIDED AND POTENTIAL LIABILITY."
    },
    acceptance: {
      title: "1. Acceptance of the Agreement",
      content: "This legally binding Agreement governs your use of the Trip Genie app. By installing, accessing, or otherwise using the App, you irrevocably consent to all of the terms herein and acknowledge that any violation or breach of this Agreement may subject you to civil, criminal, or administrative liability. The Company reserves the exclusive and absolute right, at any time, to modify, amend, or revise these Terms and Conditions, which shall take effect immediately upon their posting within the App. Your continued use of the App after any such modifications constitutes full and unqualified acceptance of the updated terms."
    },
    eligibility: {
      title: "2. User Eligibility and Responsibility",
      content: "By accessing the App, you hereby affirm that you are at least eighteen (18) years of age or have obtained the legal majority according to the laws of your jurisdiction. Furthermore, you affirm that you are fully able and competent to enter into, and comply with, the terms, conditions, and obligations set forth in this Agreement. Any misrepresentation of age or eligibility shall constitute a material breach of this Agreement, and the Company shall bear no liability for your noncompliance with applicable legal requirements. You are solely responsible for maintaining the confidentiality of your account credentials and for any and all activities that occur under your account. The Company assumes no responsibility for any unauthorized access to your account and disclaims any liability arising from your failure to safeguard your credentials. You agree to promptly notify the Company of any suspected unauthorized use of your account."
    },
    license: {
      title: "3. Grant of License",
      content: "Subject to your compliance with the terms and conditions of this Agreement, the Company hereby grants you a limited, non-exclusive, non-transferable, revocable license to use the Trip Genie App solely for your personal, non-commercial use. Any commercial use, reproduction, or distribution of the App, in whole or in part, is strictly prohibited without express prior written consent from the Company."
    },
    bookings: {
      title: "4. Bookings and Third-Party Services",
      content: "The App facilitates seamless booking services for travel accommodations, flights, transportation, and activities. HOWEVER, ALL BOOKINGS ARE ULTIMATELY PROCESSED AND MANAGED THROUGH INDEPENDENT THIRD-PARTY PROVIDERS. YOU EXPRESSLY ACKNOWLEDGE THAT THE COMPANY IS NOT A PARTY TO ANY AGREEMENT ENTERED INTO BETWEEN YOU AND SUCH THIRD PARTIES AND DISCLAIMS ANY AND ALL RESPONSIBILITY ARISING FROM OR RELATING TO THESE AGREEMENTS. You assume full responsibility for reading and understanding the terms, conditions, and restrictions applicable to any third-party service before completing a booking. The Company disclaims any liability for delays, cancellations, modifications, or other disruptions to your travel plans that may occur due to actions or omissions of third-party providers. Any disputes or claims arising from your transactions with such providers must be resolved directly with the relevant third party."
    },
    obligations: {
      title: "5. User Obligations and Prohibited Conduct",
      content: "By using the App, you expressly agree not to: Use the App for any illegal, fraudulent, or unauthorized purpose; Engage in any activity that disrupts or interferes with the App's operation, including but not limited to introducing viruses, malware, or other harmful software; Misrepresent your identity or use another person's account without permission; Violate any applicable laws, regulations, or contractual obligations in connection with your use of the App. The Company reserves the absolute right to investigate any breach of this Agreement and to take appropriate legal action, including, but not limited to, referring violations to law enforcement authorities or immediately terminating your access to the App without notice. You hereby waive any and all claims against the Company for any such actions."
    },
    budgeting: {
      title: "6. Smart Budgeting Disclaimer",
      content: "The budgeting tools provided in Trip Genie are solely for the purpose of assisting users in planning their financial expenditures during travel. THESE TOOLS ARE PROVIDED  WITHOUT WARRANTY OF ANY KIND. The Company disclaims any liability for inaccuracies, errors, or omissions that may arise from the use of such budgeting tools and assumes no responsibility for any financial loss, over-budget expenses, or unanticipated costs that may occur."
    },
    localInfo: {
      title: "7. No Guarantee of Accuracy for Local Information",
      content: "Trip Genie may provide you with information concerning local activities, events, and points of interest, including but not limited to ticket prices, transportation directions, and business hours. While the Company endeavors to provide accurate information, ALL SUCH INFORMATION IS SUBJECT TO CHANGE WITHOUT NOTICE, AND THE COMPANY MAKES NO REPRESENTATIONS OR WARRANTIES AS TO THE ACCURACY, RELIABILITY, OR COMPLETENESS OF SUCH INFORMATION. You are responsible for verifying the accuracy of any information before acting upon it."
    },
    giftShop: {
      title: "8. Exclusive In-App Gift Shop Purchases",
      content: "All purchases made through the in-app gift shop are subject to final sale. YOU ASSUME ALL RISKS ASSOCIATED WITH THE PURCHASE OF ITEMS FROM THIRD-PARTY VENDORS FEATURED IN THE GIFT SHOP. The Company expressly disclaims any and all liability related to product quality, authenticity, shipping, or customer service issues arising from such purchases. You agree to resolve any disputes directly with the vendor."
    },
    liability: {
      title: "9. Limitation of Liability",
      content: "TO THE FULLEST EXTENT PERMITTED BY LAW, THE COMPANY, ITS AFFILIATES, OFFICERS, EMPLOYEES, AGENTS, OR LICENSORS SHALL NOT BE LIABLE FOR ANY INDIRECT, CONSEQUENTIAL, SPECIAL, EXEMPLARY, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE APP, INCLUDING BUT NOT LIMITED TO LOST PROFITS, LOST DATA, LOSS OF GOODWILL, PERSONAL INJURY, OR PROPERTY DAMAGE, EVEN IF THE COMPANY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. YOUR SOLE REMEDY FOR DISSATISFACTION WITH THE APP OR ANY PART OF IT IS TO CEASE USING THE APP IMMEDIATELY."
    },
    indemnification: {
      title: "10. Indemnification",
      content: "YOU AGREE TO INDEMNIFY, DEFEND, AND HOLD HARMLESS THE COMPANY, ITS AFFILIATES, DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, AND LICENSORS FROM AND AGAINST ANY AND ALL CLAIMS, DAMAGES, LOSSES, LIABILITIES, COSTS, AND EXPENSES (INCLUDING REASONABLE ATTORNEY'S FEES) ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE APP, ANY VIOLATION OF THIS AGREEMENT, OR YOUR VIOLATION OF ANY RIGHTS OF A THIRD PARTY."
    },
    disputeResolution: {
      title: "11. Dispute Resolution and Governing Law",
      content: "This Agreement and all related claims shall be governed and construed in accordance with the laws of applicable jurisdictions, without regard to its conflict of law provisions. Any disputes arising out of or relating to this Agreement or your use of the App shall be exclusively resolved through binding arbitration conducted by a recognized arbitration body within the applicable jurisdictions. YOU HEREBY WAIVE ANY RIGHT TO A JURY TRIAL OR TO PARTICIPATE IN A CLASS ACTION LAWSUIT AGAINST THE COMPANY."
    },
    severability: {
      title: "12. Severability and Waiver",
      content: "If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions of this Agreement shall remain in full force and effect. No waiver of any term or condition of this Agreement shall be deemed a continuing waiver or a waiver of any other term or condition, and any failure of the Company to assert a right or provision under this Agreement shall not constitute a waiver of such right or provision."
    },
    entireAgreement: {
      title: "13. Entire Agreement",
      content: "This Agreement constitutes the entire agreement between you and the Company regarding the use of the App and supersedes all prior agreements and understandings, whether written or oral, regarding the subject matter hereof."
    },
    contact: {
      title: "14. Contact Information",
      content: "If you have any questions regarding this Agreement, please contact us at: Email: support@tripgenie.com"
    }
  };
  const scrollToSection = (sectionKey) => {
    const sectionRef = sectionRefs.current[sectionKey];
    const navbarHeight = 60; // Adjust this value to match your navbar's height
    if (sectionRef && sectionRef.current) {
      const top = sectionRef.current.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({
        top: top,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#E6DCCF]/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-[#388A94] text-4xl font-bold mb-8">Terms & Conditions</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <nav className="bg-white rounded-lg shadow-lg p-4 sticky top-4">
              {Object.entries(sections).map(([key, section]) => (
                <button
                  key={key}
                  onClick={() => scrollToSection(key)}
                  className="w-full text-left px-4 py-3 rounded-md transition-colors mb-2 text-[#1A3B47] hover:bg-[#B5D3D1]/20"
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>

          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              {Object.entries(sections).map(([key, section]) => (
                <div key={key} ref={sectionRefs.current[key]} className="mb-8">
                  <h2 className="text-2xl font-bold text-[#388A94] mb-4">
                    {section.title}
                  </h2>
                  <div className="prose max-w-none">
                    <p className="text-[#1A3B47] leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;