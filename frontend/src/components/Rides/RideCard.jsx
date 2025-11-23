import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { MapPin, Clock, Users, DollarSign, Car } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GenderBadge from '../shared/GenderBadge';
import CommunityTag from '../shared/CommunityTag';
import { format } from 'date-fns';

export default function RideCard({ ride, showBookButton = true, userGender = null }) {
  // Gender visibility enforcement
  if (ride.gender_preference === 'Female Only' && userGender === 'Male') {
    return null; // Hide completely from male users
  }

  const canBook = ride.seats_available > 0 && ride.status === 'scheduled';
  const isFemalePreferred = ride.gender_preference === 'Female Preferred' && userGender === 'Male';

  return (
    <Card className="hover:shadow-xl transition-shadow duration-300 border-2 border-gray-200 hover:border-yellow-400">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Car className="w-5 h-5 text-yellow-600" />
              <h3 className="font-bold text-lg">{ride.ride_type === 'carpool' ? 'Carpool' : 'Shared Cab'}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <GenderBadge preference={ride.gender_preference} size="sm" />
              {ride.visibility === 'community_only' && (
                <CommunityTag community="Community Only" size="sm" />
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-600">₹{ride.base_price}</div>
            <div className="text-xs text-gray-500">per seat</div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-semibold">{ride.start_point?.address || 'Pickup Location'}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-semibold">{ride.destination?.address || 'Drop Location'}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {format(new Date(ride.start_time), 'MMM dd, h:mm a')}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {ride.seats_available} seat{ride.seats_available !== 1 ? 's' : ''} left
          </div>
        </div>

        {ride.estimated_distance_km && (
          <div className="text-xs text-gray-500 mb-3">
            ~{ride.estimated_distance_km.toFixed(1)} km • {ride.estimated_duration_mins} mins
          </div>
        )}

        {showBookButton && (
          <Link to={createPageUrl('RideDetails') + '?id=' + ride.id}>
            <Button 
              className={`w-full font-bold ${
                isFemalePreferred 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-black hover:bg-gray-800 text-yellow-400'
              }`}
              disabled={!canBook}
            >
              {!canBook ? 'Fully Booked' : isFemalePreferred ? 'Request to Book' : 'Book Now'}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}