import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'
import Cookies from 'js-cookie'

export default function PaymentPopup({
  isOpen,
  onClose,
  title,
  items,
  onWalletPayment,
  stripeKey, 
  currency
}) {
  const [paymentType, setPaymentType] = useState('credit')
  const [isProcessing, setIsProcessing] = useState(false)


  const totalPrice = items.reduce((sum, item) => sum + item.price, 0)
  // use currency to format the price
  const formattedPrice = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency
  }).format(totalPrice / 100)

  const handleStripeRedirect = async () => {
    try {
      setIsProcessing(true)
      console.log("Redirecting to Stripe...")

      const stripe = await loadStripe(stripeKey)

      if (!stripe) {
        throw new Error('Stripe failed to initialize')
      }

      const response = await fetch("http://localhost:4000/create-booking-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map(item => ({
            product: {
              name: item.name,
            },
            quantity: 1,
            totalPrice: item.price,
          })),
          currency: 'gbp',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          `Failed to create checkout session: ${errorData.error || response.statusText}`
        )
      }

      const { id: sessionId } = await response.json()

      if (!sessionId) {
        throw new Error("No session ID returned from the server")
      }

      console.log("Session ID received:", sessionId)

      const result = await stripe.redirectToCheckout({
        sessionId: sessionId,
      })

      if (result.error) {
        throw new Error(result.error.message)
      }
    } catch (error) {
      console.error("Error in redirecting to Stripe:", error)
      // You might want to show an error message to the user here
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirm = async () => {
    if (paymentType === 'wallet') {
      onWalletPayment()
    } else {
      await handleStripeRedirect()
    }
  }

  return (
    (<Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-semibold">
              {title}
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>{item.name}</span>
                <span>{new Intl.NumberFormat('en-GB', {
                  style: 'currency',
                  currency: 'GBP'
                }).format(item.price / 100)}</span>
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="flex justify-between font-semibold">
                <span>Total Price</span>
                <span>{formattedPrice}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Payment Type</p>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="credit"
                    checked={paymentType === 'credit'}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="h-4 w-4 text-blue-600" />
                  <span>Credit Card</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="debit"
                    checked={paymentType === 'debit'}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="h-4 w-4 text-blue-600" />
                  <span>Debit Card</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="wallet"
                    checked={paymentType === 'wallet'}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="h-4 w-4 text-blue-600" />
                  <span>Wallet</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {isProcessing ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>)
  );
}

