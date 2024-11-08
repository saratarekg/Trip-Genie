import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Award, Star } from "lucide-react"

export default function TourguideProfileCard({ profile }) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Tourguide Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profile.avatarUrl} alt={profile.username} />
            <AvatarFallback>{profile.username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <h3 className="mt-2 text-xl font-semibold">{profile.username}</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center">
            <Mail className="w-5 h-5 mr-2 text-gray-500" aria-hidden="true" />
            <span>{profile.email}</span>
          </div>
          <div className="flex items-center">
            <Phone className="w-5 h-5 mr-2 text-gray-500" aria-hidden="true" />
            <span>+{profile.mobile}</span>
          </div>
          <div className="flex items-center">
            <Award className="w-5 h-5 mr-2 text-gray-500" aria-hidden="true" />
            <span>{profile.yearsOfExperience} years of experience</span>
          </div>
          <div className="flex items-center">
            <Star className="w-5 h-5 mr-2 text-[#F88C33]" aria-hidden="true" />
            <span>{profile.rating} / 5.0</span>
          </div>
        </div>
        {/* <div>
          <h4 className="font-semibold mb-2">Languages</h4>
          <div className="flex flex-wrap gap-2">
            {profile.languages.map((lang, index) => (
              <Badge key={index} variant="secondary">{lang}</Badge>
            ))}
          </div>
        </div> */}
        {/* <div>
          <h4 className="font-semibold mb-2">Specialties</h4>
          <div className="flex flex-wrap gap-2">
            {profile.specialties.map((specialty, index) => (
              <Badge key={index} variant="outline">{specialty}</Badge>
            ))}
          </div>
        </div> */}
      </CardContent>
    </Card>
  )
}