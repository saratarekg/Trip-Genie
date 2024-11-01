'use client'

import { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function TravelBookingForm() {
  const [departureDate, setDepartureDate] = useState( new Date())
  const [returnDate, setReturnDate] = useState(new Date())

  // Example locations - you can expand this list
  const locations = [
    "Dubai",
    "London",
    "New York",
    "Tokyo",
    "Paris",
    "Singapore",
  ]

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="From" />
        </SelectTrigger>
        <SelectContent>
          {locations.map((location) => (
            <SelectItem key={location} value={location}>
              {location}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="To" />
        </SelectTrigger>
        <SelectContent>
          {locations.map((location) => (
            <SelectItem key={location} value={location}>
              {location}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[180px] justify-start text-left font-normal",
              !departureDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            {departureDate ? format(departureDate, "PPP") : "Departure"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={departureDate}
            onSelect={setDepartureDate}
            initialFocus
            disabled={(date) =>
              date < new Date() || (returnDate && date > returnDate)
            }
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[180px] justify-start text-left font-normal",
              !returnDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            {returnDate ? format(returnDate, "PPP") : "Return"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={returnDate}
            onSelect={setReturnDate}
            initialFocus
            disabled={(date) =>
              date < new Date() || (departureDate && date < departureDate)
            }
          />
        </PopoverContent>
      </Popover>

      <Button className="px-8 bg-orange-400 hover:bg-orange-500">
        Book Now
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  )
}