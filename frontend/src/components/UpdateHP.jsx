"use client"

import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios';
import Cookies from 'js-cookie'
import { Check, Plus, XCircle, X, CheckCircle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
    <svg className="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
      <circle className="path" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
    </svg>
  </div>
)

export default function UpdateHistoricalPlace() {
  const { id } = useParams()
  const [historicalPlace, setHistoricalPlace] = useState({
    title: '',
    description: '',
    location: {
      address: '',
      city: '',
      country: '',
    },
    openingHours: {
      weekdays: '',
      weekends: '',
    },
    ticketPrices: {
      native: 0,
      student: 0,
      foreigner: 0,
    },
    currency: '',
    historicalTag: [],
    pictures: [],
  })
  const [loading, setLoading] = useState(true)
  const [citiesLoading, setCitiesLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userRole, setUserRole] = useState(Cookies.get('role') || 'guest')
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [newPictureUrl, setNewPictureUrl] = useState('')
  const [countries, setCountries] = useState([])
  const [cities, setCities] = useState([])
  const [formErrors, setFormErrors] = useState({})
  const [showErrorPopup, setShowErrorPopup] = useState(null)
  const [availableTags, setAvailableTags] = useState([])
  const [newTag, setNewTag] = useState('')
  const [currencies, setCurrencies] = useState([]);
  const navigate = useNavigate()

  const titleRef = useRef(null)
  const descriptionRef = useRef(null)
  const addressRef = useRef(null)
  const countryRef = useRef(null)
  const cityRef = useRef(null)
  const nativePriceRef = useRef(null)
  const studentPriceRef = useRef(null)
  const foreignerPriceRef = useRef(null)
  const pictureUrlRef = useRef(null)

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const token = Cookies.get('jwt')
        const response = await axios.get(`http://localhost:4000/tourism-governor/currencies`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setCurrencies(response.data)
      } catch (err) {
        console.error('Error fetching currencies:', err.message)
        setError('Failed to fetch currencies. Please try again.')
      }
    }

    fetchCurrencies()
  }, [])

  useEffect(() => {
    const fetchHistoricalPlaceDetails = async () => {
      setLoading(true)
      try {
        const token = Cookies.get('jwt')
        const response = await fetch(`http://localhost:4000/${userRole}/historical-places/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }

        const historicalPlaceData = await response.json()
        if (!historicalPlaceData.historicalTag) {
          historicalPlaceData.historicalTag = []
        }
        setHistoricalPlace(historicalPlaceData)
        setError(null)
      } catch (err) {
        setError('Error fetching data. Please try again later.')
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistoricalPlaceDetails()
    fetchCountries()
    fetchAvailableTags()
  }, [id, userRole])

  useEffect(() => {
    if (historicalPlace.location.country) {
      fetchCities(historicalPlace.location.country)
    } else {
      setCities([])
    }
  }, [historicalPlace.location.country])

  const fetchCountries = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all')
      const data = await response.json()
      const sortedCountries = data.map(country => country.name.common).sort()
      setCountries(sortedCountries)
    } catch (error) {
      console.error('Error fetching countries:', error)
    }
  }

  const fetchCities = async (country) => {

    setCitiesLoading(true)
    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ country }),
      })

      const data = await response.json()

      

      if (data.error) {
        throw new Error(data.msg || 'Failed to fetch cities ')
      }

      const sortedCities = data.data.sort()
      setCities(sortedCities)
    } catch (err) {
      if (err.status===404){
        setCities([])
      }
      //setError('Error fetching cities. Please try again later. ')
      console.error('Error fetching cities: ', err)
      setCities([])
    } finally {
      setCitiesLoading(false)
    }
  }

  const fetchAvailableTags = async () => {
    try {
      const token = Cookies.get('jwt')
      const response = await fetch(`http://localhost:4000/${userRole}/historical-tag`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch tags')
      }

      const tags = await response.json()
      setAvailableTags(tags)
    } catch (err) {
      console.error('Error fetching tags:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setHistoricalPlace((prev) => {
      const newState = { ...prev }
      if (name.includes('.')) {
        const [parent, child] = name.split('.')
        newState[parent] = { ...newState[parent], [child]: value }
      } else {
        newState[name] = value
      }

      if (name.startsWith('ticketPrices.')) {
        const price = parseFloat(value)
        if (isNaN(price) || price < 0) {
          newState.ticketPrices = { ...newState.ticketPrices, [name.split('.')[1]]: 0 }
        }
      }

      return newState
    })

    setFormErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSelectChange = (name, value) => {
    setHistoricalPlace((prev) => {
      const newState = { ...prev }
      if (name.includes('.')) {
        const [parent, child] = name.split('.')
        newState[parent] = { ...newState[parent], [child]: value }
      } else {
        newState[name] = value
      }
      return newState
    })

    setFormErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const errors = {}
  
    if (!historicalPlace.title.trim()) {
      errors.title = 'Title is required'
    }
    if (!historicalPlace.description.trim()) {
      errors.description = 'Description is required'
    }
    if (!historicalPlace.location.address.trim()) {
      errors.address = 'Address is required'
    }
    if (!historicalPlace.location.country) {
      errors.country = 'Country is required'
    }
    if (!historicalPlace.location.city) {
      errors.city = 'City is required'
    }
    
    if (historicalPlace.ticketPrices.native < 0) {
      errors.nativePrice = 'Native ticket price cannot be negative'
    }
    if (historicalPlace.ticketPrices.student < 0) {
      errors.studentPrice = 'Student ticket price cannot be negative'
    }
    if (historicalPlace.ticketPrices.foreigner < 0) {
      errors.foreignerPrice = 'Foreigner ticket price cannot be negative'
    }
  
    // Validate opening hours
    if (!historicalPlace.openingHours.weekdays.trim()) {
      errors.weekdays = 'Weekdays opening hours are required'
    }
    if (!historicalPlace.openingHours.weekends.trim()) {
      errors.weekends = 'Weekends opening hours are required'
    }
  
    if (newPictureUrl && !/^https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)$/i.test(newPictureUrl)) {
      errors.pictureUrl = 'Invalid picture URL. Must be a valid image URL.'
    }
  
    setFormErrors(errors)
  
    return Object.keys(errors).length === 0
  }
  

  const handleUpdate = async () => {
    if (!validateForm()) {
      const firstErrorField = Object.keys(formErrors)[0]
      if (firstErrorField) {
        const refMap = {
          title: titleRef,
          description: descriptionRef,
          'location.address': addressRef,
          'location.country': countryRef,
          'location.city': cityRef,
          'ticketPrices.native': nativePriceRef,
          'ticketPrices.student': studentPriceRef,
          'ticketPrices.foreigner': foreignerPriceRef,
          pictureUrl: pictureUrlRef,
        }
        const fieldRef = refMap[firstErrorField]
        if (fieldRef && fieldRef.current) {
          fieldRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
          fieldRef.current.focus()
        }
      }
      return
    }

    setLoading(true)
    try {
      const token = Cookies.get('jwt')
      const response = await fetch(`http://localhost:4000/${userRole}/historical-places/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(historicalPlace),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 400) {
          setShowErrorPopup(errorData.message)
          return
        }
        if (response.status === 403) {
          setShowErrorPopup(errorData.message)
          return
        }
        throw new Error('Failed to update historical place')
      }

      setShowSuccessPopup(true)
    } catch (err) {
      setError('Error updating historical place. Please try again later.')
      console.error('Error updating historical place:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPicture = () => {
    const urlPattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i
    if (!urlPattern.test(newPictureUrl)) {
      setFormErrors((prev) => ({ ...prev, pictureUrl: 'Invalid picture URL. Must be a valid image URL.' }))
      if (pictureUrlRef.current) {
        pictureUrlRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        pictureUrlRef.current.focus()
      }
      return
    }

    if (newPictureUrl.trim()) {
      setHistoricalPlace((prev) => ({
        ...prev,
        pictures: [...prev.pictures, newPictureUrl.trim()],
      }))
      setNewPictureUrl('')
      setFormErrors((prev) => ({ ...prev, pictureUrl: '' }))
    }
  }

  const handleRemovePicture = (index) => {
    setHistoricalPlace((prev) => ({
      ...prev,
      pictures: prev.pictures.filter((_, i) => i !== index),
    }))
  }

  const handleAddTag = () => {
    if (newTag && !historicalPlace.historicalTag.some(tag => tag._id === newTag)) {
      const tagToAdd = availableTags.find(tag => tag._id === newTag)
      if (tagToAdd) {
        setHistoricalPlace((prev) => ({
          ...prev,
          historicalTag: [...prev.historicalTag, tagToAdd],
        }))
        setNewTag('')
      }
    }
  }

  const handleRemoveTag = (tagId) => {
    setHistoricalPlace((prev) => ({
      ...prev,
      historicalTag: prev.historicalTag.filter((tag) => tag._id !== tagId),
    }))
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-8">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Update Historical Place</h1>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={historicalPlace.title}
                  onChange={handleChange}
                  ref={titleRef}
                  className={formErrors.title ? 'border-red-500' : ''}
                />
                {formErrors.title && <p className="text-red-500">{formErrors.title}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={historicalPlace.description}
                  onChange={handleChange}
                  rows={5}
                  ref={descriptionRef}
                  className={formErrors.description ? 'border-red-500' : ''}
                />
                {formErrors.description && <p className="text-red-500">{formErrors.description}</p>}
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Location</h2>
                <div>
                  <Label htmlFor="location.address">Address</Label>
                  <Input
                    id="location.address"
                    name="location.address"
                    value={historicalPlace.location.address}
                    onChange={handleChange}
                    ref={addressRef}
                    className={formErrors.address ? 'border-red-500'  : ''}
                  />
                  {formErrors.address && <p className="text-red-500">{formErrors.address}</p>}
                </div>
                <div>
                  <Label htmlFor="location.country">Country</Label>
                  <Select
                    name="location.country"
                    onValueChange={(value) => handleSelectChange('location.country', value)}
                    value={historicalPlace.location.country}
                    ref={countryRef}
                    className={formErrors.country ? 'border-red-500' : ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.country && <p className="text-red-500">{formErrors.country}</p>}
                </div>
                <div>
                  <Label htmlFor="location.city">City</Label>
                  {historicalPlace.location.country && cities.length === 0 && !citiesLoading && (
                    <p className="text-red-500">No cities available for the selected country.</p>
                  )}
                  {citiesLoading ? (
                    <p>Loading cities...</p>
                  ) : (
                    <Select
                      name="location.city"
                      onValueChange={(value) => handleSelectChange('location.city', value)}
                      value={historicalPlace.location.city}
                      ref={cityRef}
                      className={formErrors.city ? 'border-red-500' : ''}
                      disabled={!historicalPlace.location.country || cities.length === 0 || citiesLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={citiesLoading ? "Loading cities..." : "Select a city"} />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {formErrors.city && <p className="text-red-500">{formErrors.city}</p>}
                </div>
              </div>

              <div className="space-y-4">
  <h2 className="text-2xl font-semibold">Opening Hours</h2>
  <div>
    <Label htmlFor="openingHours.weekdays">Weekdays</Label>
    <Input
      id="openingHours.weekdays"
      name="openingHours.weekdays"
      value={historicalPlace.openingHours.weekdays}
      onChange={handleChange}
      className={formErrors.weekdays ? 'border-red-500' : ''}
    />
    {formErrors.weekdays && <p className="text-red-500">{formErrors.weekdays}</p>}
  </div>
  <div>
    <Label htmlFor="openingHours.weekends">Weekends</Label>
    <Input
      id="openingHours.weekends"
      name="openingHours.weekends"
      value={historicalPlace.openingHours.weekends}
      onChange={handleChange}
      className={formErrors.weekends ? 'border-red-500' : ''}
    />
    {formErrors.weekends && <p className="text-red-500">{formErrors.weekends}</p>}
  </div>
</div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Ticket Prices</h2>
                <div>
                  <Label htmlFor="ticketPrices.native">Native</Label>
                  <Input
                    type="number"
                    id="ticketPrices.native"
                    name="ticketPrices.native"
                    value={historicalPlace.ticketPrices.native}
                    onChange={handleChange}
                    min="0"
                    ref={nativePriceRef}
                    className={formErrors.nativePrice ? 'border-red-500' : ''}
                  />
                  {formErrors.nativePrice && <p className="text-red-500">{formErrors.nativePrice}</p>}
                </div>
                <div>
                  <Label htmlFor="ticketPrices.student">Student</Label>
                  <Input
                    type="number"
                    id="ticketPrices.student"
                    name="ticketPrices.student"
                    value={historicalPlace.ticketPrices.student}
                    onChange={handleChange}
                    min="0"
                    ref={studentPriceRef}
                    className={formErrors.studentPrice ? 'border-red-500' : ''}
                  />
                  {formErrors.studentPrice && <p className="text-red-500">{formErrors.studentPrice}</p>}
                </div>
                <div>
                  <Label htmlFor="ticketPrices.foreigner">Foreigner</Label>
                  <Input
                    type="number"
                    id="ticketPrices.foreigner"
                    name="ticketPrices.foreigner"
                    value={historicalPlace.ticketPrices.foreigner}
                    onChange={handleChange}
                    min="0"
                    ref={foreignerPriceRef}
                    className={formErrors.foreignerPrice ? 'border-red-500' : ''}
                  />
                  {formErrors.foreignerPrice && <p className="text-red-500">{formErrors.foreignerPrice}</p>}
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    name="currency"
                    onValueChange={(value) => handleSelectChange('currency', value)}
                    value={historicalPlace.currency}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency._id} value={currency._id}>
                          {currency.code} - {currency.name} ({currency.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.currency && <p className="text-red-500">{formErrors.currency}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {historicalPlace.historicalTag.map((tag) => (
                    <div key={tag._id} className="flex items-center bg-gray-200 rounded-full px-3 py-1">
                      <span>{tag.type} - {tag.period}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 p-0"
                        onClick={() => handleRemoveTag(tag._id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <Select
                    value={newTag}
                    onValueChange={setNewTag}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select a tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTags.map((tag) => (
                        <SelectItem key={tag._id} value={tag._id}>
                          {tag.type} - {tag.period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddTag} disabled={!newTag}>
                    Add Tag
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Pictures</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {historicalPlace.pictures.map((pic, index) => (
                    <Card key={index} className="relative">
                      <CardContent className="p-2">
                        <img src={pic} alt={`Historical Place ${index + 1}`} className="w-full h-32 object-cover rounded" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => handleRemovePicture(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  <Card>
                    <CardContent className="p-2">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="New picture URL"
                          value={newPictureUrl}
                          onChange={(e) => setNewPictureUrl(e.target.value)}
                          ref={pictureUrlRef}
                          className={formErrors.pictureUrl ? 'border-red-500' : ''}
                        />
                        <Button onClick={handleAddPicture} size="icon" disabled={!newPictureUrl.trim()}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {formErrors.pictureUrl && <p className="text-red-500">{formErrors.pictureUrl}</p>}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button variant="default" onClick={handleUpdate}>
                Update Historical Place
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showSuccessPopup} onOpenChange={setShowSuccessPopup}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
              Historical Place Updated
            </DialogTitle>
            <DialogDescription>
              The historical place has been successfully updated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => navigate('/all-historical-places')}>
              Back to All Historical Places
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showErrorPopup !== null} onOpenChange={() => setShowErrorPopup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <XCircle className="w-6 h-6 text-red-500 inline-block mr-2" />
              Failed to Update Historical Place
            </DialogTitle>
            <DialogDescription>
              {showErrorPopup || 'An error occurred while updating the historical place.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="default" onClick={() => setShowErrorPopup(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}