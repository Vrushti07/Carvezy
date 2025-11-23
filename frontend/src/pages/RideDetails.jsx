import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { MapPin, Clock, Users, DollarSign, User, Phone, Shield, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import GenderBadge from '../components/shared/GenderBadge';
import { format } from 'date-fns';
import { toast } from 'sonner';

// --- PLACE useReservationTimer HOOK HERE ---
const useReservationTimer = (expiry, onExpire) => {
  const [secondsLeft, setSecondsLeft] = useState(null);

  useEffect(() => {
    if (!expiry) {
      setSecondsLeft(null);
      return;
    }

    const initialSeconds = Math.floor((new Date(expiry).getTime() - Date.now()) / 1000);
    setSecondsLeft(Math.max(0, initialSeconds));

    if (initialSeconds <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev === 1) {
          clearInterval(timer);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [expiry, onExpire]);

  return secondsLeft;
};
// ------------------------------------------

export default function RideDetails() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const rideId = urlParams.get('id');
  
  const [user, setUser] = useState(null);
  const [showOffer, setShowOffer] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [reservationToken, setReservationToken] = useState(null);
  const [reservationExpiry, setReservationExpiry] = useState(null);
  
  // Custom hook to handle cleanup and toast on expiry
  const handleReservationExpire = useCallback(() => {
    if (reservationToken) {
        toast.error('Reservation expired! Seats have been released.');
        // Optionally, you might want to call an API to confirm cancellation
        // base44.entities.Reservation.cancelByToken(reservationToken); 
        queryClient.invalidateQueries({ queryKey: ['ride', rideId] });
    }
    setReservationToken(null);
    setReservationExpiry(null);
  }, [reservationToken, queryClient, rideId]);

  // Use the new hook for the dynamic timer
  const secondsLeft = useReservationTimer(reservationExpiry, handleReservationExpire);

  useEffect(() => {
    // Note: It's usually better to handle auth check outside the component via a router or AuthContext
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  // ... (useQuery definitions for ride, driver, vehicle remain UNCHANGED) ...
  
  const { data: ride, isLoading } = useQuery({ /* ... (unchanged) */ });
  const { data: driver } = useQuery({ /* ... (unchanged) */ });
  const { data: vehicle } = useQuery({ /* ... (unchanged) */ });

  // Create reservation mutation
  const createReservationMutation = useMutation({
    mutationFn: async () => {
      if (!user?.verified) {
        throw new Error('You must be verified to book rides');
      }
      if (user.blacklisted) {
        throw new Error('Your account is restricted');
      }
      if (ride.gender_preference === 'Female Only' && user.gender === 'Male') {
        throw new Error('This ride is Female Only');
      }
      if (ride.seats_available < 1) {
        throw new Error('No seats available');
      }

      // Create 90-second reservation
      const expiresAt = new Date(Date.now() + 90000).toISOString();
      // NOTE: Using RES- prefix for a token is not secure; use a proper UUID/Hash in production
      const token = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; 
      
      const reservation = await base44.entities.Reservation.create({
        ride_id: rideId,
        user_id: user.id,
        seats_reserved: 1,
        reserved_at: new Date().toISOString(),
        expires_at: expiresAt,
        status: 'pending',
        reservation_token: token
      });

      // Decrement available seats (Optimistic update on the server)
      await base44.entities.Ride.update(rideId, {
        seats_available: ride.seats_available - 1
      });

      return { reservation, expiresAt, token };
    },
    onSuccess: ({ reservation, expiresAt, token }) => {
      setReservationToken(token);
      setReservationExpiry(expiresAt);
      queryClient.invalidateQueries({ queryKey: ['ride', rideId] });
      toast.success('Seat reserved! Complete booking within 90 seconds.');
      
      // Removed the setTimeout here as the useReservationTimer hook now handles expiry.
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reserve seat');
      // If reservation failed due to seat availability, re-fetch the ride data
      queryClient.invalidateQueries({ queryKey: ['ride', rideId] }); 
    }
  });

  // ... (confirmBookingMutation and submitOfferMutation remain UNCHANGED) ...
  
  const confirmBookingMutation = useMutation({ /* ... (unchanged) */ });
  const submitOfferMutation = useMutation({ /* ... (unchanged) */ });


  if (isLoading) {
    return <div className="p-8 text-center">Loading ride details...</div>;
  }

  if (!ride) {
    return <div className="p-8 text-center">Ride not found</div>;
  }

  const isFemalePreferred = ride.gender_preference === 'Female Preferred' && user?.gender === 'Male';
  const canBook = ride.seats_available > 0 && user && user.id !== ride.host_driver_id;
  
  // ... (JSX render remains largely the same, but the timer section is updated) ...

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ... (Ride Info Card UNCHANGED) ... */}
        <Card className="border-2 border-yellow-400">
          <CardHeader className="bg-black text-yellow-400">
            <CardTitle className="text-2xl">Ride Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* ... Route, Details Grid, Driver Notes ... */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="text-sm text-gray-500">Pickup</div>
                  <div className="text-lg font-semibold">{ride.start_point.address}</div>
                </div>
              </div>
              <div className="border-l-2 border-dashed border-gray-300 ml-3 h-8" />
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="text-sm text-gray-500">Drop</div>
                  <div className="text-lg font-semibold">{ride.destination.address}</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="text-sm text-gray-500">Departure</div>
                  <div className="font-semibold">{format(new Date(ride.start_time), 'PPp')}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="text-sm text-gray-500">Seats Available</div>
                  <div className="font-semibold">{ride.seats_available} / {ride.seat_capacity}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="text-sm text-gray-500">Price per Seat</div>
                  <div className="font-semibold text-yellow-600 text-xl">₹{ride.base_price}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-gray-600" />
                <GenderBadge preference={ride.gender_preference} />
              </div>
            </div>

            {ride.driver_notes && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-900">
                  <strong>Driver Note:</strong> {ride.driver_notes}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* ... (Driver Info Card UNCHANGED) ... */}
        {driver && (
          <Card>
            <CardHeader>
              <CardTitle>Driver Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16 bg-yellow-400 text-black border-2 border-black">
                  <AvatarFallback className="text-xl font-bold">
                    {driver.full_name?.[0]?.toUpperCase() || 'D'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-lg">{driver.full_name}</div>
                  <div className="text-sm text-gray-500">★ {driver.rating?.toFixed(1)} • {driver.total_rides_as_driver} rides</div>
                  {driver.verified && (
                    <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                      <Shield className="w-4 h-4" />
                      Verified Driver
                    </div>
                  )}
                </div>
              </div>
              {vehicle && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-medium mb-2">Vehicle Details</div>
                  <div className="text-sm text-gray-600">
                    {vehicle.model} • {vehicle.color} • {vehicle.plate_number}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ... (Booking Actions UNCHANGED) ... */}
        {canBook && !reservationToken && (
          <Card className="border-2 border-black">
            <CardContent className="p-6 space-y-4">
              {!user?.verified && (
                <Alert className="bg-orange-50 border-orange-400">
                  <AlertDescription className="text-orange-900">
                    <strong>Verification Required:</strong> You must verify your identity to book rides.
                    <Link to={createPageUrl('Profile')} className="underline ml-1 font-semibold">
                      Go to Profile to verify
                    </Link>
                  </AlertDescription>
                </Alert>
              )}

              {isFemalePreferred && (
                <Alert className="bg-purple-50 border-purple-400">
                  <AlertDescription className="text-purple-900">
                    This is a Female Preferred ride. Male riders need driver approval.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Button
                  onClick={() => createReservationMutation.mutate()}
                  disabled={createReservationMutation.isPending || !ride.seats_available || !user?.verified}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold h-12 text-lg disabled:opacity-50"
                >
                  {!user?.verified ? 'Verify Account to Book' : ride.seats_available ? 'Book Now' : 'Fully Booked'}
                </Button>

                <Button
                  onClick={() => setShowOffer(!showOffer)}
                  variant="outline"
                  className="w-full border-2 border-black hover:bg-gray-100 font-semibold"
                >
                  Make a Counter Offer
                </Button>

                {showOffer && (
                  <div className="pt-4 border-t space-y-3">
                    <Input
                      type="number"
                      placeholder="Your offer amount (₹)"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      min="1"
                      step="0.5"
                    />
                    <Button
                      onClick={() => submitOfferMutation.mutate(offerAmount)}
                      disabled={!offerAmount || submitOfferMutation.isPending}
                      className="w-full bg-black hover:bg-gray-800 text-yellow-400"
                    >
                      Submit Offer
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reservation Confirmation - UPDATED */}
        {reservationToken && (
          <Card className="border-4 border-yellow-400 bg-yellow-50">
            <CardContent className="p-6 text-center space-y-4">
              <div>
                <div className="text-lg font-semibold mb-2">Seat Reserved!</div>
                <div className="text-sm text-gray-600">
                  Complete booking within 90 seconds
                </div>
                <div className="text-2xl font-bold text-yellow-600 mt-2">
                  {secondsLeft !== null ? `${secondsLeft}s` : 'Expiring...'}
                </div>
              </div>
              <Button
                onClick={() => confirmBookingMutation.mutate()}
                disabled={confirmBookingMutation.isPending || secondsLeft === 0}
                className="w-full bg-black hover:bg-gray-800 text-yellow-400 font-bold h-12 text-lg"
              >
                Confirm & Pay ₹{ride.base_price}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}