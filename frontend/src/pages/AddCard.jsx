import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { CreditCard, Trash2, X } from 'lucide-react'

export default function AddCard() {
  const [cards, setCards] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null)
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    holderName: '',
    cvv: '',
    paymentMethod: '',
    default: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      const token = Cookies.get('jwt')
      const response = await axios.get('http://localhost:4000/tourist/cards', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCards(Array.isArray(response.data.cards) ? response.data.cards : [])
    } catch (error) {
      console.error('Error fetching cards:', error)
      setMessage({ text: "Failed to fetch cards. Please try again.", type: "error" })
      setCards([])
      hideMessageAfterDelay()
    }
  }

  const hideMessageAfterDelay = () => {
    setTimeout(() => {
      setMessage({ text: '', type: '' })
    }, 5000)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setCardDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateCard = () => {
    const newErrors = {}
    if (!cardDetails.cardNumber) {
      newErrors.cardNumber = "Card number is required"
    } else if (!/^[0-9]{16}$/.test(cardDetails.cardNumber)) {
      newErrors.cardNumber = "Please enter a valid 16-digit card number"
    }
    if (!cardDetails.expiryDate) {
      newErrors.expiryDate = "Expiry date is required"
    } else if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(cardDetails.expiryDate)) {
      newErrors.expiryDate = "Please enter a valid expiry date in MM/YY format"
    } else {
      const [month, year] = cardDetails.expiryDate.split('/')
      const expiryDate = new Date(`20${year}`, month - 1)
      const currentDate = new Date()
      currentDate.setDate(1)
      if (expiryDate <= currentDate) {
        newErrors.expiryDate = "Expiry date must be in the future"
      }
    }
    if (!cardDetails.holderName.trim()) {
      newErrors.holderName = "Card holder name is required"
    }
    if (!cardDetails.cvv) {
      newErrors.cvv = "CVV is required"
    } else if (!/^[0-9]{3,4}$/.test(cardDetails.cvv)) {
      newErrors.cvv = "Please enter a valid 3 or 4 digit CVV"
    }
    if (!cardDetails.paymentMethod) {
      newErrors.paymentMethod = "Payment method is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateCard()) return

    setIsLoading(true)
    setMessage({ text: '', type: '' })

    try {
      const token = Cookies.get('jwt')
      await axios.put(
        'http://localhost:4000/tourist/add-card',
        cardDetails,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setMessage({ text: "Card added successfully", type: "success" })
      hideMessageAfterDelay()
      setShowAddForm(false)
      fetchCards()
      setCardDetails({
        cardNumber: '',
        expiryDate: '',
        holderName: '',
        cvv: '',
        paymentMethod: '',
        default: false
      })
    } catch (error) {
      setMessage({ text: error.response?.data?.message || "Failed to add card. Please try again.", type: "error" })
      hideMessageAfterDelay()
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetDefault = async (cardId) => {
    try {
      const token = Cookies.get('jwt')
      await axios.put(
        `http://localhost:4000/tourist/add-default-card/${cardId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchCards()
      setMessage({ text: "Default card updated successfully", type: "success" })
      hideMessageAfterDelay()
    } catch (error) {
      setMessage({ text: "Failed to update default card. Please try again.", type: "error" })
      hideMessageAfterDelay()
    }
  }

  const handleRemoveCard = async (cardId) => {
    try {
      const token = Cookies.get('jwt')
      await axios.delete(
        `http://localhost:4000/tourist/card/${cardId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchCards()
      setMessage({ text: "Card removed successfully", type: "success" })
      hideMessageAfterDelay()
    } catch (error) {
      setMessage({ text: "Failed to remove card. Please try again.", type: "error" })
      hideMessageAfterDelay()
    } finally {
      setShowRemoveConfirm(null)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Your Payment Cards</h2>
      {message.text && (
        <div className={`p-4 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}
      
      {Array.isArray(cards) && cards.length > 0 ? (
        cards.map((card) => (
          <div key={card._id} className="border rounded-md p-4 mb-4 flex justify-between items-center bg-white shadow-sm">
            <div className="flex items-center space-x-4">
              <CreditCard className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-semibold">{card.paymentMethod === 'CREDIT_CARD' ? 'Credit Card' : 'Debit Card'}</p>
                <p>Card Number: **** **** **** {card.cardNumber.slice(-4)}</p>
                <p>Exp Date: {card.expiryDate}</p>
                <p>Holder: {card.holderName}</p>
                {card.default && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                    Default
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              {!card.default && (
                <button 
                  onClick={() => handleSetDefault(card._id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 ease-in-out"
                >
                  Set as Default
                </button>
              )}
              <button 
                onClick={() => setShowRemoveConfirm(card._id)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 ease-in-out flex items-center justify-center"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Remove
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No cards found. Add a new card to get started.</p>
      )}

      <button 
        onClick={() => setShowAddForm(true)}
        className="w-full py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300 ease-in-out mb-4"
      >
        Add New Card
      </button>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[70vh] overflow-y-auto relative">
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-xl font-bold mb-4">Add New Card</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="paymentMethod" className="block mb-2">Payment Method</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={cardDetails.paymentMethod}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${errors.paymentMethod ? 'border-red-500' : ''}`}
                >
                  <option value="">Select payment method</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                </select>
                {errors.paymentMethod && <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>}
              </div>
              <div>
                <label htmlFor="cardNumber" className="block mb-2">Card Number</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={cardDetails.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  className={`w-full p-2 border rounded-md ${errors.cardNumber ? 'border-red-500' : ''}`}
                />
                {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
              </div>
              <div>
                <label htmlFor="expiryDate" className="block mb-2">Expiry Date</label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  value={cardDetails.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  className={`w-full p-2 border rounded-md ${errors.expiryDate ? 'border-red-500' : ''}`}
                />
                {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
              </div>
              <div>
                <label htmlFor="holderName" className="block mb-2">Card Holder Name</label>
                <input
                  type="text"
                  id="holderName"
                  name="holderName"
                  value={cardDetails.holderName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={`w-full p-2 border rounded-md ${errors.holderName ? 'border-red-500' : ''}`}
                />
                {errors.holderName && <p className="text-red-500 text-sm mt-1">{errors.holderName}</p>}
              </div>
              <div>
                <label htmlFor="cvv" className="block mb-2">CVV</label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={cardDetails.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  className={`w-full p-2 border rounded-md ${errors.cvv ? 'border-red-500' : ''}`}
                />
                {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
              </div>
              <div>
                <label htmlFor="default" className="flex items-center">
                  <input
                    type="checkbox"
                    id="default"
                    name="default"
                    checked={cardDetails.default}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Set as default
                </label>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 transition duration-300 ease-in-out"
              >
                {isLoading ? 'Adding...' : 'Add Card'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Remove Card</h3>
            <p className="mb-4">Are you sure you want to remove this card?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRemoveConfirm(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-300 ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveCard(showRemoveConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 ease-in-out"
              >
                Remove
              
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}