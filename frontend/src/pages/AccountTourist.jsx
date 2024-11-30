import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronRight,
  CreditCard,
  MapPin,
  ShoppingBag,
  User,
  Car,
  Wallet,
  ShoppingCartIcon,
  Lock,
  AlertTriangle,
  Settings,
  HistoryIcon,
  Calendar,
  HelpCircle,
  Eye,
  MessageSquare,
  LogOut,
  Trash2,
  XCircle,
  CheckCircle,
  Heart,
  DollarSign,
  FileText,
  HomeIcon,
  Plane,
  Hotel,
  Bookmark,
  ChevronLeft,
  CircleDot,
  Clock,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import Popup from "@/components/popup";
import "@/styles/Popup.css";
import Sidebar from '@/components/Sidebar';


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PasswordChanger from "@/components/Passwords";
import { TouristProfileComponent } from "@/components/touristProfile";
import FileComplaintForm from "@/components/FileComplaintForm";
import TravelPreferences from "@/components/TouristPreferences";
import TouristActivities from "@/pages/TouristActivities";
import TouristItineraries from "@/pages/TouristItineraries";

import FAQ from "@/pages/FAQs";
import TouristAttendedActivities from "@/pages/TouristAttended";
import TouristAttendedItineraries from "@/pages/TouristAttendedItineraries";

import UpcomingTransportation from "@/pages/TransportationUpcomming";
import HistoryTransportation from "@/pages/TransportationHistory";
import AddCard from "@/pages/AddCard";
import ShippingAddress from "@/pages/AddShippingAddress";
import ShoppingCart from "@/components/touristCart.jsx";
import WishlistPage from "@/components/touristWishlist.jsx";
import { MyComplaintsComponent } from "@/components/myComplaints";
import { AdvertiserProfileComponent } from "@/components/AdvertiserProfileComponent";
import { SellerProfileComponent } from "@/components/SellerProfileComponent";
import { TourGuideProfileComponent } from "@/components/tourGuideProfile";
import Savedactivites from "@/components/Savedactivites";
import Saveditineraries from "@/components/Saveditineraries";
import ProductReportSeller from "../components/ProductReportSellerForSeller.jsx";

import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@/components/ui/toast";


// Sub-components
const AccountInfo = ({ user }) => {
  switch (user.role) {
    case "advertiser":
      return <AdvertiserProfileComponent />;
    case "seller":
      return <SellerProfileComponent />;
    case "tour-guide":
      return <TourGuideProfileComponent />;
    case "tourist":
      return <TouristProfileComponent tourist={user} />;
    default:
      return (
        <div>
          <h2 className="text-2xl font-bold mb-4">Account Information</h2>
          <p>
            <strong>Name:</strong> {user.username}
          </p>
          {/* make the user role not seperated by hyphen and first letter capital */}
          <p>
            <strong>Role:</strong>{" "}
            {user.role.charAt(0).toUpperCase() +
              user.role.slice(1).replace("-", " ")}
          </p>
        </div>
      );
  }
};



const ExternalFlightBookings = ({ user }) => {
  const [flights, setFlights] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [preferredCurrency, setPreferredCurrency] = useState({
    code: "USD",
    symbol: "$",
  })
  const [selectedFlight, setSelectedFlight] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const fetchFlights = async () => {
    try {
      const token = Cookies.get("jwt")
      const [flightsResponse, currencyResponse] = await Promise.all([
        axios.get("http://localhost:4000/tourist/my-flights", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:4000/tourist/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      setFlights(flightsResponse.data)

      const currencyId = currencyResponse.data.preferredCurrency
      const currencyDetailsResponse = await axios.get(
        `http://localhost:4000/tourist/getCurrency/${currencyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setPreferredCurrency(currencyDetailsResponse.data)

      setIsLoading(false)
    } catch (err) {
      setError("Failed to fetch flight bookings or currency information")
      setIsLoading(false)
    }
  }

  const handleCancelFlight = async () => {
    try {
      const token = Cookies.get("jwt")
      const response = await axios.post(
        `http://localhost:4000/tourist/cancel-flight/${selectedFlight}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.status === 200) {
        setToast({
          type: "success",
          title: "Success",
          description: "Flight booking canceled successfully!",
        })
        setIsDialogOpen(false)
        fetchFlights()
      }
    } catch (err) {
      console.error(err)
      setToast({
        type: "error",
        title: "Error",
        description: "Failed to cancel the flight booking.",
      })
    }
  }

  useEffect(() => {
    fetchFlights()
  }, [])

  if (isLoading) return <div>Loading flight bookings...</div>
  if (error) return <div>{error}</div>

  return (
    <ToastProvider>
      <div className="max-w-7xl mx-auto space-y-6 p-4">
        <h2 className="text-2xl font-bold">Flight Bookings</h2>
        {flights.map((flight, index) => (
          <Card key={index} className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-xl font-semibold">
                {preferredCurrency.symbol}{flight.price}
              </div>
              <span className="text-sm text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
                {flight.seatType}
              </span>
            </div>

            <div className="flex">
              {/* Left section (3/4) */}
              <div className="w-3/4 pr-6 border-r">
                {/* Outbound Flight */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Depart</div>
                      <div className="text-3xl font-bold">
                        {new Date(flight.departureDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(flight.departureDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">{flight.from}</div>
                    </div>

                    <div className="flex-1 flex flex-col items-center mx-4">
                      <div className="w-full flex items-center gap-2">
                        <CircleDot className="h-4 w-4 text-blue-500 shrink-0" />
                        <div className="w-full border-t-2 border-dashed border-blue-500 relative">
                          <span className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 text-xs text-gray-500 bg-white px-2">
                            {/* Calculate duration */}
                            2h 10m
                          </span>
                        </div>
                        <CircleDot className="h-4 w-4 text-blue-500 shrink-0" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Arrive</div>
                      <div className="text-3xl font-bold">
                        {new Date(flight.arrivalDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(flight.arrivalDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">{flight.to}</div>
                    </div>
                  </div>
                </div>

                {/* Return Flight if exists */}
                {flight.returnDepartureDate && (
                  <div className="pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-500">Depart</div>
                        <div className="text-3xl font-bold">
                          {new Date(flight.returnDepartureDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(flight.returnDepartureDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">{flight.to}</div>
                      </div>

                      <div className="flex-1 flex flex-col items-center mx-4">
                        <div className="w-full flex items-center gap-2">
                          <CircleDot className="h-4 w-4 text-blue-500 shrink-0" />
                          <div className="w-full border-t-2 border-dashed border-blue-500 relative">
                            <span className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 text-xs text-gray-500 bg-white px-2">
                              2h 10m
                            </span>
                          </div>
                          <CircleDot className="h-4 w-4 text-blue-500 shrink-0" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm text-gray-500">Arrive</div>
                        <div className="text-3xl font-bold">
                          {new Date(flight.returnArrivalDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(flight.returnArrivalDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">{flight.from}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Important Notices */}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>Show e-tickets and passenger identities during check-in</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Please be at the boarding gate at least 30 minutes before boarding time</span>
                  </div>
                </div>
              </div>

              {/* Right section (1/4) */}
              <div className="w-1/4 pl-6 space-y-6">
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium">{user?.name || 'Passenger Name'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium">{user?.email || 'passenger@email.com'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Flight Number</div>
                  <div className="font-medium">{flight.flightID}</div>
                </div>
                <div className="flex gap-8">
                  <div>
                    <div className="text-sm text-gray-500">Gate</div>
                    <div className="text-2xl font-bold">A2</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Seat</div>
                    <div className="text-2xl font-bold">24</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedFlight(flight._id)
                    setIsDialogOpen(true)
                  }}
                >
                  Cancel Booking
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {/* Confirmation Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Flight Booking</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to cancel this booking? This action cannot be
              undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleCancelFlight}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Toast Notification */}
        {toast && (
          <Toast>
            <ToastTitle>{toast.title}</ToastTitle>
            <ToastDescription>{toast.description}</ToastDescription>
            <ToastClose onClick={() => setToast(null)} />
          </Toast>
        )}
        <ToastViewport />
      </div>
    </ToastProvider>
  )
}


const ExternalHotelBookings = ({ user }) => {
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preferredCurrency, setPreferredCurrency] = useState({
    code: "USD",
    symbol: "$",
  });
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchHotels = async () => {
    try {
      const token = Cookies.get("jwt");
      const [hotelsResponse, currencyResponse] = await Promise.all([
        axios.get("http://localhost:4000/tourist/my-hotels", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:4000/tourist/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setHotels(hotelsResponse.data);

      const currencyId = currencyResponse.data.preferredCurrency;
      const currencyDetailsResponse = await axios.get(
        `http://localhost:4000/tourist/getCurrency/${currencyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPreferredCurrency(currencyDetailsResponse.data);

      setIsLoading(false);
    } catch (err) {
      setError("Failed to fetch hotel bookings or currency information");
      setIsLoading(false);
    }
  };

  const handleCancelHotel = async () => {
    try {
      const token = Cookies.get("jwt");
      const response = await axios.post(
        `http://localhost:4000/tourist/cancel-hotel/${selectedHotel}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setToast({
          type: "success",
          title: "Success",
          description: "Hotel booking canceled successfully!",
        });
        setIsDialogOpen(false);
        fetchHotels();
      }
    } catch (err) {
      console.error(err);
      setToast({
        type: "error",
        title: "Error",
        description: "Failed to cancel the hotel booking.",
      });
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  if (isLoading) return <div>Loading hotel bookings...</div>;
  if (error) return <div>{error}</div>;

  return (
    <ToastProvider>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Hotel Bookings</h2>
        {hotels.map((hotel, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{hotel.hotelName}</CardTitle>
              <CardDescription>
                Check-in: {new Date(hotel.checkinDate).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Hotel ID: {hotel.hotelID}</p>
              <p>
                Check-out: {new Date(hotel.checkoutDate).toLocaleDateString()}
              </p>
              <p>Number of Rooms: {hotel.numberOfRooms}</p>
              <p>Room Name: {hotel.roomName}</p>
              <p>
                Price: {preferredCurrency.symbol}
                {hotel.price}
              </p>
              <p>Number of Adults: {hotel.numberOfAdults}</p>

              {/* Cancel Button */}
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => {
                  setSelectedHotel(hotel._id);
                  setIsDialogOpen(true);
                }}
              >
                Cancel Booking
              </Button>
            </CardContent>
          </Card>
        ))}

        {/* Confirmation Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Hotel Booking</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleCancelHotel}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Toast Notification */}
        {toast && (
          <Toast>
            <ToastTitle>{toast.title}</ToastTitle>
            <ToastDescription>{toast.description}</ToastDescription>
            <ToastClose onClick={() => setToast(null)} />
          </Toast>
        )}
        <ToastViewport />
      </div>
    </ToastProvider>
  );
};



const Upcoming = ({ user }) => {
  switch (user.role) {
    case "tourist":
      return <TouristActivities />;
    case "tourism-governor":
      return (
        <div className="p-4 text-center">
          Activity management is handled in the admin dashboard.
        </div>
      );
    case "seller":
      return (
        <div className="p-4 text-center">
          Manage your listings in the seller dashboard.
        </div>
      );
    case "advertiser":
      return (
        <div className="p-4 text-center">
          View your ad campaigns in the advertiser dashboard.
        </div>
      );
    case "tour-guide":
      return (
        <div className="p-4 text-center">
          Check your upcoming tours in the tour guide dashboard.
        </div>
      );
    default:
      return (
        <div className="p-4 text-center">
          No upcoming activities available for {user.role}.
        </div>
      );
  }
};

const Cart = ({ user }) => {
  if (user.role === "tourist") {
    return <ShoppingCart />;
  } else {
    return <div>Cart not available for {user.role}</div>;
  }
};

const Wishlist = ({ user }) => {
  if (user.role === "tourist") {
    return <WishlistPage />;
  } else {
    return <div>Wishlist not available for {user.role}</div>;
  }
};

const History = ({ user }) => {
  if (user.role === "tourist") {
    return <TouristAttendedActivities />;
  } else {
    return <div>History not available for {user.role}</div>;
  }
};

const HistoryItineraries = ({ user }) => {
  if (user.role === "tourist") {
    return <TouristAttendedItineraries />;
  } else {
    return <div>History not available for {user.role}</div>;
  }
};

const UpcommingTransportationBooking = ({ user }) => {
  if (user.role === "tourist") {
    return <UpcomingTransportation />;
  } else {
    return (
      <div>Upcomming Transportations are not available for {user.role}</div>
    );
  }
};

const UpcomingItineraries = ({ user }) => {
  if (user.role === "tourist") {
    return <TouristItineraries />;
  } else {
    return (
      <div>Upcomming Itineraries are not available for {user.role}</div>
    );
  }
};


const HistoryTransportationBooking = ({ user }) => {
  if (user.role === "tourist") {
    return <HistoryTransportation />;
  } else {
    return (
      <div>Upcomming Transportations are not available for {user.role}</div>
    );
  }
};

const Complaint = () => <FileComplaintForm />;

const Preferences = ({ user }) => {
  if (user.role === "tourist") {
    return <TravelPreferences />;
  } else {
    return <div>Preferences not available for {user.role}</div>;
  }
};

const FAQs = () => <FAQ />;

const RedeemPoints = ({ user, onRedeemPoints }) => {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState(null);
  const [redeemSuccess, setRedeemSuccess] = useState(null);
  const [rates, setRates] = useState({});
  const [currencies, setCurrencies] = useState([]);
  const [preferredCurrency, setPreferredCurrency] = useState("USD");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("jwt");
        const [ratesResponse, currenciesResponse] = await Promise.all([
          axios.get("http://localhost:4000/rates", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:4000/tourist/currencies", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetchUserInfo(),
        ]);
        setRates(ratesResponse.data.rates);
        setCurrencies(currenciesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    // if type of from currency is string and to currency is string  return (amount / rates[fromCurrency]) * rates[toCurrency]
    if (typeof fromCurrency === "string" && typeof toCurrency === "string") {
      return (amount / rates[fromCurrency]) * rates[toCurrency];
    }
    if (typeof fromCurrency !== "string" && typeof toCurrency === "string") {
      return (amount / rates[fromCurrency.code]) * rates[toCurrency];
    }
    if (typeof fromCurrency !== "string" && typeof toCurrency !== "string") {
      return (amount / rates[fromCurrency.code]) * rates[toCurrency.code];
    }

    if (typeof fromCurrency === "string" && typeof toCurrency !== "string") {
      return (amount / rates[fromCurrency]) * rates[toCurrency.code];
    }

    if (!rates[fromCurrency] || !rates[toCurrency.code]) return amount;
    return (amount / rates[fromCurrency]) * rates[toCurrency.code];
  };

  const formatCurrency = (amount, currency) => {
    const currencyInfo = currencies.find((c) => c.code === currency.code);
    return `${currencyInfo ? currencyInfo.symbol : ""}${amount.toFixed(2)}`;
  };

  const convertedWalletAmount = convertCurrency(
    user.wallet,
    "USD",
    preferredCurrency
  );
  const pointsValueInEGP = user.loyaltyPoints / 100;
  const pointsValueInUSD = convertCurrency(pointsValueInEGP, "EGP", "USD");
  const pointsValueInPreferredCurrency = convertCurrency(
    pointsValueInUSD,
    "USD",
    preferredCurrency
  );

  console.log("Converted wallet amount:", convertedWalletAmount);
  console.log("Points value in EGP:", pointsValueInEGP);
  console.log("Points value in USD:", pointsValueInUSD);
  console.log(
    "Points value in preferred currency:",
    pointsValueInPreferredCurrency
  );

  const fetchUserInfo = useCallback(async () => {
    const role = Cookies.get("role") || "guest";
    if (role === "tourist") {
      try {
        const token = Cookies.get("jwt");
        if (!token) {
          console.error("No JWT token found");
          return;
        }

        const response = await axios.get("http://localhost:4000/tourist/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currencyId = response.data.preferredCurrency;

        if (currencyId) {
          const response2 = await axios.get(
            `http://localhost:4000/tourist/getCurrency/${currencyId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setPreferredCurrency(response2.data);
        } else {
          console.error("No preferred currency found for user");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
  }, []);

  const handleRedeemClick = async () => {
    setIsRedeeming(true);
    setRedeemError(null);
    setRedeemSuccess(null);

    try {
      await onRedeemPoints(user.loyaltyPoints);
      setRedeemSuccess(`Successfully redeemed ${user.loyaltyPoints} points`);
    } catch (error) {
      setRedeemError(
        error.message || "An error occurred while redeeming points"
      );
    } finally {
      setIsRedeeming(false);
    }
  };

  if (user.role !== "tourist") {
    return <div>Points redemption not available for {user.role}</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto bg-gray-50 shadow-xl rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Redeem Loyalty Points</h2>
      <p className="text-lg text-gray-700 mb-6">
        Convert your loyalty points into wallet balance.
      </p>

      <div className="space-y-4 mb-6">
        <p className="text-lg font-medium text-gray-600">
          Available Wallet Balance:{" "}
          <span className="text-teal-600">
            {formatCurrency(convertedWalletAmount, preferredCurrency)}
          </span>
        </p>
        <p className="text-lg font-medium text-gray-600">
          Loyalty Points:{" "}
          <span className="text-blue-600">{(user.loyaltyPoints).toFixed(2)} points</span>
        </p>
      </div>

      <Button
        onClick={handleRedeemClick}
        disabled={isRedeeming || user.loyaltyPoints === 0}
        className="w-full py-3 bg-[#F88C33] text-white rounded-lg hover:bg-orange-500 transition duration-300 ease-in-out"
      >
        {isRedeeming
          ? "Redeeming..."
          : `Redeem Points for ${formatCurrency(
              pointsValueInPreferredCurrency,
              preferredCurrency
            )}`}
      </Button>

      {/* Error Message */}
      {redeemError && (
        <p className="text-red-500 text-sm text-center mt-4">{redeemError}</p>
      )}

      {/* Success Message */}
      {redeemSuccess && (
        <p className="text-green-500 text-sm text-center mt-4">
          {redeemSuccess}
        </p>
      )}
    </div>
  );
};

const CurrencyApp = ({ user }) => {
  const [currencies, setCurrencies] = useState([]);
  const [preferredCurrency, setPreferredCurrency] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState("");

  const fetchPreferredCurrencyCode = async () => {
    if (user.role === "tourist") {
      try {
        const token = Cookies.get("jwt");
        const codeResponse = await axios.get(
          "http://localhost:4000/tourist/currencies/idd",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const preferredCurrencyCode = codeResponse.data;
        console.log("Preferred Currency Code:", preferredCurrencyCode);

        const currencyResponse = await axios.get(
          `http://localhost:4000/tourist/getCurrency/${preferredCurrencyCode}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPreferredCurrency(currencyResponse.data);
      } catch (error) {
        console.error("Error fetching preferred currency details:", error);
      }
    }
  };

  useEffect(() => {
    if (user.role === "tourist") {
      const fetchSupportedCurrencies = async () => {
        try {
          const token = Cookies.get("jwt");
          const response = await axios.get(
            "http://localhost:4000/tourist/currencies",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setCurrencies(response.data);
        } catch (error) {
          console.error("Error fetching supported currencies:", error);
        }
      };

      fetchSupportedCurrencies();
      fetchPreferredCurrencyCode();
    }
  }, [user]);

  const handleSetPreferredCurrency = async () => {
    if (user.role === "tourist") {
      try {
        const token = Cookies.get("jwt");
        await axios.post(
          "http://localhost:4000/tourist/currencies/set",
          { currencyId: selectedCurrency },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        openSuccessPopup("Preferred currency set successfully!");

        fetchPreferredCurrencyCode();
      } catch (error) {
        console.error("Error setting preferred currency:", error);
        openErrorPopup(error);
      }
    }
  };

  const [popupType, setPopupType] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const openSuccessPopup = (message) => {
    setPopupType("success");
    setPopupOpen(true);
    setPopupMessage(message);
  };

  const openErrorPopup = (message) => {
    setPopupType("error");
    setPopupOpen(true);
    setPopupMessage(message);
  };

  const closePopup = () => {
    setPopupOpen(false);
  };

  if (user.role !== "tourist") {
    return <div>Currency settings not available for {user.role}</div>;
  }

  return (
    <div className="container p-8 max-w-lg mx-auto bg-white shadow-lg rounded-lg">
      <Popup
        isOpen={popupOpen}
        onClose={closePopup}
        type={popupType}
        message={popupMessage}
      />
      <h1 className="text-2xl font-bold mb-4">Preferred Currency</h1>
      <h2 className="text-xl font-bold mb-4">
        {preferredCurrency
          ? `${preferredCurrency.name} (${preferredCurrency.code})`
          : "Loading..."}
      </h2>

      <label className="block text-lg font-medium text-gray-700 mb-5">
        <span>Select New Preferred Currency:</span>
        <div className="relative mt-2">
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="w-full p-4 rounded-lg border-2 border-teal-600 text-teal-600 bg-teal-50 font-medium focus:ring-teal-500 focus:border-teal-500 transition duration-300 ease-in-out"
          >
            <option value="" disabled>
              Choose Currency
            </option>
            {currencies.map((currency) => (
              <option key={currency._id} value={currency._id}>
                {currency.name} ({currency.code})
              </option>
            ))}
          </select>
        </div>
      </label>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSetPreferredCurrency}
          disabled={!selectedCurrency}
          className={`w-36 py-3 rounded-lg text-white font-semibold focus:outline-none transition duration-300 ease-in-out ${
            selectedCurrency
              ? "bg-[#F88C33] hover:bg-orange-600 cursor-pointer" //className="flex items-center justify-center w-full py-2 bg-[#F88C33] text-white rounded-md hover:bg-orange-500 transition duration-300 ease-in-out mb-4"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Set
        </button>
      </div>
    </div>
  );
};

const DeleteAccount = ({ onClose }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState(null);
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const token = Cookies.get("jwt");
      const role = Cookies.get("role");
      const response = await axios.delete(
        `http://localhost:4000/${role}/delete-account`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setDeleteResult({
          success: true,
          message: "Your account has been successfully deleted.",
        });
        Cookies.remove("jwt");
        Cookies.remove("role");
      }
    } catch (error) {
      setDeleteResult({
        success: false,
        message:
          error.response?.data?.message ||
          "An error occurred while deleting your account.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (deleteResult && deleteResult.success) {
      navigate("/login"); // Redirect to login page if deletion is successful
    } else {
      onClose(); // Close the dialog if deletion is not successful
    }
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {deleteResult ? (
              deleteResult.success ? (
                <span className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2" />
                  Account Deleted
                </span>
              ) : (
                <span className="flex items-center">
                  <XCircle className="text-red-500 mr-2" />
                  Error
                </span>
              )
            ) : (
              "Delete Account"
            )}
          </DialogTitle>
          <DialogDescription>
            {deleteResult
              ? deleteResult.message
              : "Are you sure you want to delete your account? This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {!deleteResult && (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </>
          )}
          {deleteResult && deleteResult.success && (
            <Button onClick={() => navigate("/")}>Return to Home</Button>
          )}
          {deleteResult && !deleteResult.success && (
            <Button onClick={onClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function AccountManagement() {
  const [activeTab, setActiveTab] = useState("info");
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const getUserRole = () => Cookies.get("role") || "guest";
  const role = getUserRole();





  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = Cookies.get("jwt");
        const role = getUserRole();
        const api = `http://localhost:4000/${role}`;
        const response = await axios.get(api, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser({ ...response.data, role });
      } catch (err) {
        setError(err.message);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const path = location.pathname.split("/").pop();
    if (path === "account" || path === "") {
      setActiveTab("info");
    } else {
      setActiveTab(path);
    }
  }, [location]);

  const handleRedeemPoints = async () => {
    try {
      const token = Cookies.get("jwt");
      const role = getUserRole();
      const api = `http://localhost:4000/${role}/redeem-points`;
      const response = await axios.post(
        api,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser((prevUser) => ({
        ...prevUser,
        wallet: response.data.walletBalance,
        loyaltyPoints: response.data.remainingPoints,
      }));

      return response.data;
    } catch (error) {
      console.error("Error redeeming points:", error);
      throw new Error(
        error.response?.data?.error ||
          "Failed to redeem points. Please try again."
      );
    }
  };

  const renderContent = () => {
    if (isLoading) return <div className="text-center">Loading...</div>;
    if (error)
      return <div className="text-center text-red-500">Error: {error}</div>;
    if (!user)
      return <div className="text-center">No user data available.</div>;

    switch (activeTab) {
      case "info":
        return <AccountInfo user={user} />;
      case "complain":
        return <Complaint />;
      case "my-complaints":
        return <MyComplaintsComponent />;
      case "cart":
        return <Cart user={user} />;
      case "wishlist":
        return <Wishlist user={user} />;
      case "history":
        return <History user={user} />;
        case "historyItineraries":
        return <HistoryItineraries user={user} />;
      case "upcomingActivities":
        return <Upcoming user={user} />;
        case "upcomingItineraries":
        return <UpcomingItineraries user={user} />;
      case "upcomingTransportation":
        return <UpcommingTransportationBooking user={user} />;
      case "historyTransportation":
        return <HistoryTransportationBooking user={user} />;
      case "redeem-points":
        return <RedeemPoints user={user} onRedeemPoints={handleRedeemPoints} />;
      case "security":
        return <PasswordChanger />;
      case "SavedActivities":
        return <Savedactivites />;
      case "SavedItineraries":
        return <Saveditineraries />;

      case "preferences":
        return <Preferences user={user} />;
      case "add-card":
        return user.role === "tourist" ? (
          <AddCard />
        ) : (
          <div>Add card not available for {user.role}</div>
        );
      case "add-ship":
        return user.role === "tourist" ? (
          <ShippingAddress />
        ) : (
          <div>Add shipping address not available for {user.role}</div>
        );
      case "currency":
        return <CurrencyApp user={user} />;
      case "faqs":
        return <FAQs />;
        case "sales-report-seller":
          return <ProductReportSeller />;
      case "flight-bookings":
        return <ExternalFlightBookings user={user} />;
      case "hotel-bookings":
        return <ExternalHotelBookings user={user} />;
      default:
        return <AccountInfo user={user} />;
    }
  };

  const handleTabClick = (tab) => {
    if (tab === "delete-account") {
      setShowDeleteAccount(true);
    }else if (tab === "logout"){
      handleLogoutClick();
    } else {
      setActiveTab(tab);
      navigate(`/account/${tab}`);
    }
  };

  const menuStructure = {
    "Activities": [
      {
        name: "Saved",
        icon: Bookmark,
        tab: "SavedActivities",
        roles: ["tourist"],
      },
      {
        name: "Upcoming",
        icon: Calendar,
        tab: "upcomingActivities",
        roles: ["tourist"],
      },
      
      {
        name: "Attended",
        icon: HistoryIcon,
        tab: "history",
        roles: ["tourist"],
      },
      
    ],
    "Itineraries": [
      {
        name: "Saved",
        icon: Bookmark,
        tab: "SavedItineraries",
        roles: ["tourist"],
      },
      
      {
        name: "Upcoming",
        icon: Calendar,
        tab: "upcomingItineraries",
        roles: ["tourist"],
      },
      {
        name: "Attended",
        icon: HistoryIcon,
        tab: "historyItineraries",
        roles: ["tourist"],
      },
      
    ],
    "Transportation": [
      {
        name: "Upcoming",
        icon: Car,
        tab: "upcomingTransportation",
        roles: ["tourist"],
      },
      {
        name: "Attended",
        icon: HistoryIcon,
        tab: "historyTransportation",
        roles: ["tourist"],
      },
    ],
    // Products: [
    //   { name: "Cart", icon: ShoppingCartIcon, tab: "cart", roles: ["tourist"] },
    //   { name: "Wishlist", icon: Heart, tab: "wishlist", roles: ["tourist"] },
    // ],
    "Settings and Privacy": [
      {
        name: "Account",
        icon: User,
        tab: "info",
        roles: [
          "tourist",
          "seller",
          "advertiser",
          "tour-guide",
          "admin",
          "tourism-governor",
        ],
      },
      {
        name: "Security",
        icon: Lock,
        tab: "security",
        roles: [
          "tourist",
          "seller",
          "advertiser",
          "tour-guide",
          "admin",
          "tourism-governor",
        ],
      },
      {
        name: "Preferences",
        icon: Settings,
        tab: "preferences",
        roles: ["tourist"],
      },
      // {
      //   name: "Points and Wallet",
      //   icon: Wallet,
      //   tab: "redeem-points",
      //   roles: ["tourist"],
      // },
      // {
      //   name: "Set Currency",
      //   icon: DollarSign,
      //   tab: "currency",
      //   roles: ["tourist"],
      // },
      // {
      //   name: "Add credit/debit cards",
      //   icon: CreditCard,
      //   tab: "add-card",
      //   roles: ["tourist"],
      // },
      // {
      //   name: "Add Shipping Address",
      //   icon: HomeIcon,
      //   tab: "add-ship",
      //   roles: ["tourist"],
      // },
      {
        name: "Delete Account",
        icon: Trash2,
        tab: "delete-account",
        roles: ["tourist", "seller", "advertiser", "tour-guide"],
      },
    ],
    "View Reports": [
      {
        name: "Sales Report",
        icon: FileText,
        tab: "sales-report-seller",
        roles: ["seller"],
      },
    ],
    "Help and Support": [
      // {
      //   name: "File a Complaint",
      //   icon: AlertTriangle,
      //   tab: "complain",
      //   roles: ["tourist"],
      // },
      {
        name: "My Complaints",
        icon: FileText,
        tab: "my-complaints",
        roles: ["tourist"],
      },
      {
        name: "FAQs",
        icon: HelpCircle,
        tab: "faqs",
        roles: [
          "tourist",
          "seller",
          "advertiser",
          "tour-guide",
          "admin",
          "tourism-governor",
        ],
      },
    ],
    "External Bookings": [
      {
        name: "Flight Bookings",
        icon: Plane,
        tab: "flight-bookings",
        roles: ["tourist"],
      },
      {
        name: "Hotel Bookings",
        icon: Hotel,
        tab: "hotel-bookings",
        roles: ["tourist"],
      },
    ],
    // "Display and Accessibility": [
    //   { name: "Theme", icon: Eye, tab: "theme", roles: ["tourist", "seller", "advertiser", "tour-guide", "admin", "tourism-governor"] },
    //   { name: "Language", icon: MapPin, tab: "language", roles: ["tourist", "seller", "advertiser", "tour-guide", "admin", "tourism-governor"] },
    // ],
  
  };

  const LogoutPopup = ({ onConfirm, onCancel }) => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Are you sure you want to log out?
          </h3>
          <div className="flex justify-end gap-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  };
  

  const [showPopup, setShowPopup] = useState(false);

  const logOut = async () => {
    console.log("Logging out...");
    try {
      const response = await fetch("http://localhost:4000/auth/logout");
      if (response.ok) {
        Cookies.set("jwt", "");
        Cookies.set("role", "");
        Cookies.remove("jwt");
        Cookies.remove("role");
        console.log("Logged out successfully");
        navigate("/login");
        window.location.reload();
      } else {
        console.error("Logout failed.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleLogoutClick = () => {
    setShowPopup(true);
  };

  const handleConfirmLogout = () => {
    setShowPopup(false);
    logOut();
  };

  const handleCancelLogout = () => {
    setShowPopup(false);
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };


   return (
    <div>
      <div className="w-full bg-[#1A3B47] py-8 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      </div>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar
          menuStructure={menuStructure}
          role={role}
          activeTab={activeTab}
          onTabClick={handleTabClick}
        />
        <main className=" flex-1 p-8">
          <div className="w-full mx-auto">
            {renderContent()}
          </div>
        </main>
        
        {showDeleteAccount && (
          <DeleteAccount onClose={() => setShowDeleteAccount(false)} />
        )}
        {showPopup && (
      <LogoutPopup onConfirm={handleConfirmLogout} onCancel={handleCancelLogout} />
    )}
      </div>
    </div>
  );
}

