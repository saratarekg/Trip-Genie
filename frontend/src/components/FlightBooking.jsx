'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpDown, Calendar, Plane } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

function BookingPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [tripType, setTripType] = useState('round-trip')
  const [flights, setFlights] = useState([])
  const [accessToken, setAccessToken] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('price')
  const [sortOrder, setSortOrder] = useState('asc')
  const [priceFilter, setPriceFilter] = useState('all')
  
  const itemsPerPage = 5

  async function refreshToken() {
    const API_KEY = import.meta.env.VITE_AMADEUS_API_KEY
    const API_SECRET = import.meta.env.VITE_AMADEUS_API_SECRET
    const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': API_KEY,
        'client_secret': API_SECRET,
      }),
    })
  
    const data = await response.json()
    setAccessToken(data.access_token)
    setTimeout(refreshToken, 29 * 60 * 1000)
  }

  useEffect(() => {
    refreshToken()
  }, [])

  const handleSearch = async () => {
    if (returnDate && new Date(returnDate) < new Date(departureDate)) {
      alert("Return date cannot be before departure date.")
      return
    }    

    const response = await fetch(
      `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${from}&destinationLocationCode=${to}&departureDate=${departureDate}&returnDate=${tripType === 'round-trip' ? returnDate : ''}&adults=1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    const data = await response.json()
    setFlights(data.data)
    setCurrentPage(1)
  }

  const filterFlights = (flights) => {
    let filtered = [...flights]
    
    if (priceFilter !== 'all') {
      filtered = filtered.filter(flight => {
        const price = parseFloat(flight.price.total)
        switch(priceFilter) {
          case 'under500': return price < 500
          case 'under1000': return price < 1000
          case 'over1000': return price >= 1000
          default: return true
        }
      })
    }

    filtered.sort((a, b) => {
      const aValue = sortBy === 'price' ? parseFloat(a.price.total) : a.itineraries[0].segments[0].departure.at
      const bValue = sortBy === 'price' ? parseFloat(b.price.total) : b.itineraries[0].segments[0].departure.at
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

    return filtered
  }

  const paginatedFlights = filterFlights(flights).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filterFlights(flights).length / itemsPerPage)

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  }

  return (
    <div className="bg-amber-50 min-h-screen p-6 space-y-6">
      <h1 className="text-3xl font-bold text-teal-600 text-center">Flight Booking</h1>

      <Card className="bg-white shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              type="text"
              placeholder="From (City Code)"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border-2 border-cyan-300"
            />
            <Input
              type="text"
              placeholder="To (City Code)"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border-2 border-cyan-300"
            />
            <Input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="border-2 border-cyan-300"
            />
            {tripType === 'round-trip' && (
              <Input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="border-2 border-cyan-300"
              />
            )}
            <Select value={tripType} onValueChange={setTripType}>
              <SelectTrigger className="border-2 border-cyan-300">
                <SelectValue placeholder="Trip Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="round-trip">Round Trip</SelectItem>
                <SelectItem value="one-way">One Way</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 flex justify-center">
            <Button
              onClick={handleSearch}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8"
            >
              Search Flights
            </Button>
          </div>
        </CardContent>
      </Card>

      {flights.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="departure">Departure Time</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
                className="flex gap-2"
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortOrder.toUpperCase()}
              </Button>
            </div>
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under500">Under $500</SelectItem>
                <SelectItem value="under1000">Under $1000</SelectItem>
                <SelectItem value="over1000">Over $1000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {paginatedFlights.map((flight, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-teal-600 text-white rounded">
                        <Plane className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {flight.itineraries[0].segments[0].departure.iataCode} → {flight.itineraries[0].segments[0].arrival.iataCode}
                        </h3>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Departure: {formatDateTime(flight.itineraries[0].segments[0].departure.at)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Arrival: {formatDateTime(flight.itineraries[0].segments[0].arrival.at)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-500">
                        {flight.price.total} {flight.price.currency}
                      </p>
                      <Button className="mt-2 bg-teal-600 hover:bg-teal-700">
                        Select Flight
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => {
                if (
                  i === 0 ||
                  i === totalPages - 1 ||
                  (i >= currentPage - 2 && i <= currentPage + 2)
                ) {
                  return (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )
                } else if (i === currentPage - 3 || i === currentPage + 3) {
                  return <PaginationEllipsis key={i} />
                }
                return null
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}

export default BookingPage;


