import React, { useState, useEffect, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import axios from 'axios'
import Select from 'react-select'
import Cookies from 'js-cookie'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Range, getTrackBackground } from "react-range"

const schema = z.object({
  budget: z.number().min(0, "Budget must be a positive number").nullable(),
  price: z.number().min(0, "Price must be a positive number").nullable(),
  categories: z.array(z.object({ value: z.string(), label: z.string() })).nullable(),
  tourLanguages: z.array(z.object({ value: z.string(), label: z.string() })).nullable(),
  tourType: z.array(z.object({ value: z.string(), label: z.string() })).nullable(),
  historicalPlaceType: z.array(z.object({ value: z.string(), label: z.string() })).nullable(),
  historicalPlacePeriod: z.array(z.object({ value: z.string(), label: z.string() })).nullable(),
})

function DualHandleSliderComponent({
  min,
  max,
  symbol,
  step,
  values,
  exchangeRate,
  onChange,
  middleColor = "#f97516",
  colorRing = "orange",
}) {
  return (
    <div className="w-full px-4 py-8">
      <Range
        values={values}
        step={step}
        min={min}
        max={max}
        onChange={onChange}
        renderTrack={({ props, children }) => {
          const { key, ...restProps } = props
          return (
            <div
              {...restProps}
              className="w-full h-3 pr-2 my-4 bg-gray-200 rounded-md"
              style={{
                background: getTrackBackground({
                  values,
                  colors: ["#ccc", middleColor, "#ccc"],
                  min,
                  max,
                }),
              }}
            >
              {React.Children.map(
                children,
                (child, index) =>
                  React.cloneElement(child, { key: `thumb-${index}` })
              )}
            </div>
          )
        }}
        renderThumb={({ props, isDragged }) => {
          const { key, ...restProps } = props
          return (
            <div
              {...restProps}
              className={`w-5 h-5 transform translate-x-10 bg-white rounded-full shadow flex items-center justify-center ${
                isDragged ? `ring-2 ring-${colorRing}-500` : ""
              }`}
            >
              <div className={`w-2 h-2 bg-${colorRing}-500 rounded-full`} />
            </div>
          )
        }}
      />
      <div className="flex justify-between mt-2">
        <span className="text-sm font-medium text-gray-700">
          Min: {symbol}
          {Math.ceil(values[0] * exchangeRate)}
        </span>
        <span className="text-sm font-medium text-gray-700">
          Max: {symbol}
          {Math.ceil(values[1] * exchangeRate)}
        </span>
      </div>
    </div>
  )
}

export default function TravelPreferences() {
  const [preferences, setPreferences] = useState(null)
  const [options, setOptions] = useState({
    languages: [],
    categories: [],
    tourTypes: [],
    historicalTypes: [],
    historicalPeriods: [],
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMessage, setDialogMessage] = useState('')
  const [sliderValues, setSliderValues] = useState([0, 1000])
  const [exchangeRate, setExchangeRate] = useState(1)
  const [currencySymbol, setCurrencySymbol] = useState('$')

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      budget: null,
      price: null,
      categories: null,
      tourLanguages: null,
      tourType: null,
      historicalPlaceType: null,
      historicalPlacePeriod: null,
    },
  })

  const fetchExchangeRates = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:4000/rates")
      return response.data.rates
    } catch (error) {
      console.error("Error fetching exchange rates:", error)
      return {}
    }
  }, [])

  const fetchUserInfo = useCallback(async () => {
    const token = Cookies.get("jwt")
    try {
      const response = await axios.get("http://localhost:4000/tourist/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const currencyId = response.data.preferredCurrency

      const currencyResponse = await axios.get(
        `http://localhost:4000/tourist/getCurrency/${currencyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      return {
        preferredCurrency: currencyResponse.data
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get('jwt')
        const headers = { Authorization: `Bearer ${token}` }

        const [prefsRes, langsRes, catsRes, typesRes, histTypesRes, histPeriodsRes, exchangeRates, userInfo] = await Promise.all([
          axios.get('http://localhost:4000/tourist/preferences', { headers }),
          axios.get('http://localhost:4000/api/getAllLanguages'),
          axios.get('http://localhost:4000/api/getAllCategories'),
          axios.get('http://localhost:4000/api/getAllTypes'),
          axios.get('http://localhost:4000/api/getAllHistoricalTypes'),
          axios.get('http://localhost:4000/api/getAllHistoricalPeriods'),
          fetchExchangeRates(),
          fetchUserInfo()
        ])

        setPreferences(prefsRes.data)

        const optionsData = {
          languages: langsRes.data.map(lang => ({ value: lang, label: lang })),
          categories: catsRes.data.map(cat => ({ value: cat.name, label: cat.name })),
          tourTypes: typesRes.data.map(type => ({ value: type, label: type })),
          historicalTypes: histTypesRes.data.map(type => ({ value: type, label: type })),
          historicalPeriods: histPeriodsRes.data.map(period => ({ value: period, label: period })),
        }

        setOptions(optionsData)

        const formattedPrefs = {
          ...prefsRes.data,
          categories: prefsRes.data.categories?.map(cat => optionsData.categories.find(o => o.value === cat)) || null,
          tourLanguages: prefsRes.data.tourLanguages?.map(lang => optionsData.languages.find(o => o.value === lang)) || null,
          tourType: prefsRes.data.tourType?.map(type => optionsData.tourTypes.find(o => o.value === type)) || null,
          historicalPlaceType: prefsRes.data.historicalPlaceType?.map(type => optionsData.historicalTypes.find(o => o.value === type)) || null,
          historicalPlacePeriod: prefsRes.data.historicalPlacePeriod?.map(period => optionsData.historicalPeriods.find(o => o.value === period)) || null,
        }

        reset(formattedPrefs)

        if (userInfo && userInfo.preferredCurrency) {
          const baseRate = exchangeRates['USD'] || 1
          const targetRate = exchangeRates[userInfo.preferredCurrency.code] || 1
          setExchangeRate(targetRate / baseRate)
          setCurrencySymbol(userInfo.preferredCurrency.symbol)
        }

        setSliderValues([
          formattedPrefs.price ? formattedPrefs.price / exchangeRate : 0,
          formattedPrefs.budget ? formattedPrefs.budget / exchangeRate : 1000
        ])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [reset, fetchExchangeRates, fetchUserInfo])

  const onSubmit = async (data) => {
    try {
      const token = Cookies.get('jwt')
      const headers = { Authorization: `Bearer ${token}` }
      
      const updatedData = {
        budget: data.budget === null ? Infinity : data.budget,
        price: data.price === null ? Infinity : data.price,
        categories: data.categories?.map(item => item.value) || [],
        tourLanguages: data.tourLanguages?.map(item => item.value) || [],
        tourType: data.tourType?.map(item => item.value) || [],
        historicalPlaceType: data.historicalPlaceType?.map(item => item.value) || [],
        historicalPlacePeriod: data.historicalPlacePeriod?.map(item => item.value) || [],
      }

      await axios.put('http://localhost:4000/tourist/preferences', updatedData, { headers })
      setDialogMessage('Preferences updated successfully!')
      setIsDialogOpen(true)
    } catch (error) {
      console.error('Error updating preferences:', error)
      setDialogMessage('Failed to update preferences. Please try again.')
      setIsDialogOpen(true)
    }
  }

  const handleSliderChange = (values) => {
    setSliderValues(values)
    setValue('price', values[0])
    setValue('budget', values[1])
  }

  if (Cookies.get("role") !== "tourist") {
    return null
  }

  if (!preferences) return <div>Loading...</div>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-4 text-left">Travel Preferences</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
        <div>
            <Label className="text-sm font-medium text-gray-600 mb-1">Price and Budget Range</Label>
            <DualHandleSliderComponent
              min={0}
              max={10000}
              step={50}
              values={sliderValues}
              exchangeRate={exchangeRate}
              symbol={currencySymbol}
              onChange={handleSliderChange}
            />
          </div>
          <Controller
            name="categories"
            control={control}
            render={({ field }) => (
              <div>
                <Label htmlFor="categories" className="text-sm font-medium text-gray-600 mb-1">Categories</Label>
                <Select
                  {...field}
                  isMulti
                  options={options.categories}
                  value={field.value || []}
                  onChange={(newValue) => field.onChange(newValue)}
                  className="mt-1"
                />
              </div>
            )}
          />
          <Controller
            name="tourLanguages"
            control={control}
            render={({ field }) => (
              <div>
                <Label htmlFor="tourLanguages" className="text-sm font-medium text-gray-600 mb-1">Tour Languages</Label>
                <Select
                  {...field}
                  isMulti
                  options={options.languages}
                  value={field.value || []}
                  onChange={(newValue) => field.onChange(newValue)}
                  className="mt-1"
                />
              </div>
            )}
          />
          <Controller
            name="tourType"
            control={control}
            render={({ field }) => (
              <div>
                <Label htmlFor="tourType" className="text-sm font-medium text-gray-600 mb-1">Tour Type</Label>
                <Select
                  {...field}
                  isMulti
                  options={options.tourTypes}
                  value={field.value || []}
                  onChange={(newValue) => field.onChange(newValue)}
                  className="mt-1"
                />
              </div>
            )}
          />
          <Controller
            name="historicalPlaceType"
            control={control}
            render={({ field }) => (
              <div>
                <Label htmlFor="historicalPlaceType" className="text-sm font-medium text-gray-600 mb-1">Historical Place Type</Label>
                <Select
                  {...field}
                  isMulti
                  options={options.historicalTypes}
                  value={field.value || []}
                  onChange={(newValue) => field.onChange(newValue)}
                  className="mt-1"
                />
              </div>
            )}
          />
          <Controller
            name="historicalPlacePeriod"
            control={control}
            render={({ field }) => (
              <div>
                <Label htmlFor="historicalPlacePeriod" className="text-sm font-medium text-gray-600 mb-1">Historical Place Period</Label>
                <Select
                  {...field}
                  isMulti
                  options={options.historicalPeriods}
                  value={field.value || []}
                  onChange={(newValue) => field.onChange(newValue)}
                  className="mt-1"
                />
              </div>
            )}
          />
        </div>
        <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white">
          Update Preferences
        </Button>
      </form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
          </DialogHeader>
          <p>{dialogMessage}</p>
          <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}