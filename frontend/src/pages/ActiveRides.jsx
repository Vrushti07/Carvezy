import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { MapPin, Clock, Navigation, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card'; // CardTitle, CardHeader are unused, removed import
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import SOSButton from '../components/shared/SOSButton';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Helper function to create a unique ID based on ride and role
const getRideKey = (ride, isHost) => `${ride.id}-${isHost ? 'host' : 'rider'}`;

export default function ActiveRides() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    // Authenticate user on mount
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  // 1. Fetch Bookings (Rider Role)
  const { data: myBookings = [] } = useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn: () => base44.entities.Booking.filter({ user_id: user.id }, '-created_date'),
    enabled: !!user,
  });

  // 2. Fetch Hosted Rides (Host Role)
  const { data: myHostedRides = [] } = useQuery({
    queryKey: ['my-hosted-rides', user?.id],
    queryFn: () => base44.entities.Ride.filter({ host_driver_id: user.id }, '-start_time'),
    enabled: !!user,
  });

  // 3. Fetch Ride Details for Bookings
  // Get an array of unique ride IDs from bookings
  const bookedRideIds = useMemo(() => {
    return Array.from(new Set(myBookings.map(b => b.ride_id)));
  }, [myBookings]);

  // Fetch the actual ride details for the booked IDs
  const { data: bookedRideDetails = [] } = useQuery({
    queryKey: ['booked-ride-details', bookedRideIds],
    // Assuming base44.entities.Ride.filter can handle an array of IDs
    // If not, you'd need base44.entities.Ride.filter({ id: { $in: bookedRideIds }})
    queryFn: () => base44.entities.Ride.filter({ id__in: bookedRideIds }, '-start_time'),
    enabled: bookedRideIds.length > 0,
  });


  // 4. Combine and Filter Rides using useMemo
  const { ongoingRides, upcomingRides, completedRides } = useMemo(() => {
    const allRidesMap = new Map();
    
    // Add Hosted Rides
    myHostedRides.forEach(ride => {
      // Key includes role to distinguish if they are the host
      const key = getRideKey(ride, true);
      allRidesMap.set(key, { ...ride, isHost: true, type: 'hosted' });
    });

    // Add Booked Rides (ensure ride details exist)
    bookedRideDetails.forEach(ride => {
      // Key includes role to distinguish if they are a passenger
      const key = getRideKey(ride, false);
      // Ensure we don't accidentally override the ride details if the user is both host AND rider
      if (!allRidesMap.has(key)) {
        allRidesMap.set(key, { 
          ...ride, 
          isHost: ride.host_driver_id === user.id, // Re-check if this is the host just in case
          type: 'booked' 
        });
      }
    });

    const finalRides = Array.from(allRidesMap.values());

    return {
      ongoingRides: finalRides.filter(r => r.status === 'ongoing'),
      upcomingRides: finalRides.filter(r => r.status === 'scheduled'),
      completedRides: finalRides.filter(r => r.status === 'completed'),
    };
  }, [myHostedRides, bookedRideDetails, user]);


  // 5. Action Handlers
  const shareLocation = useCallback((ride) => {
    const url = `${window.location.origin}/track?ride=${ride.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Tracking link copied!');
  }, []);

  const startTracking = useCallback((ride) => {
    // NOTE: This implementation has several issues for real-world use (e.g., stopping tracking, 
    // handling background location). This is for demonstration only.
    if (!('geolocation' in navigator)) {
        toast.error('Geolocation is not supported by your browser.');
        return;
    }
    
    navigator.geolocation.watchPosition(
      (position) => {
        base44.entities.LocationPing.create({
          trip_id: ride.id,
          user_id: user.id,
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          // ... other tracking data
          timestamp: new Date().toISOString(),
          synced: true,
        }).catch(err => console.error("Ping failure:", err));
      },
      (error) => {
        console.error('Tracking error:', error);
        toast.error(`Tracking failed: ${error.message}`);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
    toast.success('Live tracking started (pings being sent).');
    
    // In a real app, you would also update the ride status to 'ongoing' here via a mutation.
    // base44.entities.Ride.update(ride.id, { status: 'ongoing' });
  }, [user]);


  // 6. Presentational Component
  const RideItem = ({ ride }) => {
    const isHost = ride.host_driver_id === user.id;

    return (
      <Card className="border-2 border-gray-200 hover:border-yellow-400 transition">
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="font-bold text-lg mb-1">
                {isHost ? '🚗 Hosting' : '🎒 Riding'}
              </div>
              <div className="text-sm text-gray-500">
                {format(new Date(ride.start_time), 'MMM dd, h:mm a')}
              </div>
            </div>
            {ride.status === 'ongoing' && (
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold animate-pulse">
                LIVE
              </div>
            )}
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
              <span>{ride.start_point?.address}</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-red-600 mt-0.5" />
              <span>{ride.destination?.address}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {ride.status === 'ongoing' && (
              <>
                <SOSButton rideId={ride.id} size="sm" className="flex-1" />
                <Button
                  onClick={() => shareLocation(ride)}
                  variant="outline"
                  size="sm"
                  className="border-2 border-black"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                {/* Optional: Navigation for Host */}
                {isHost && (
                    <Button 
                        onClick={() => {/* Open navigation link */}}
                        variant="default"
                        size="sm"
                    >
                        <Navigation className="w-4 h-4" />
                    </Button>
                )}
              </>
            )}
            {ride.status === 'scheduled' && isHost && (
              <Button
                onClick={() => startTracking(ride)}
                className="w-full bg-black hover:bg-gray-800 text-yellow-400"
                size="sm"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Start Ride
              </Button>
            )}
            {ride.status === 'scheduled' && !isHost && (
                 <Link to={createPageUrl('RideDetails', { id: ride.id })} className="w-full">
                    <Button variant="outline" className="w-full border-2 border-yellow-400 text-black font-semibold" size="sm">
                       View Details
                    </Button>
                 </Link>
            )}
            {ride.status === 'completed' && (
              <div className="w-full text-center text-sm text-gray-500 py-2">
                Completed
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  // ----------------------------------------------------


  if (!user) {
    return <div className="p-8 text-center">Loading user details...</div>;
  }
  
  // Use a combined loading check if needed, but separate queries handle their own states well
  // For simplicity, we assume the initial user fetch is the main gate.

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My Rides</h1>
          <p className="text-gray-600">Track and manage your journeys</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-black mb-6">
            <TabsTrigger value="ongoing" className="flex-1 data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-yellow-400">
              Ongoing ({ongoingRides.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex-1 data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-yellow-400">
              Upcoming ({upcomingRides.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-yellow-400">
              Completed ({completedRides.length})
            </TabsTrigger>
          </TabsList>

          {/* ONGOING TAB CONTENT */}
          <TabsContent value="ongoing" className="space-y-4">
            {ongoingRides.length > 0 ? (
              ongoingRides.map(ride => (
                <RideItem 
                  key={getRideKey(ride, ride.host_driver_id === user.id)}
                  ride={ride} 
                />
              ))
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="p-12 text-center text-gray-500">
                  <Navigation className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No ongoing rides</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* UPCOMING TAB CONTENT */}
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingRides.length > 0 ? (
              upcomingRides.map(ride => (
                <RideItem 
                  key={getRideKey(ride, ride.host_driver_id === user.id)} 
                  ride={ride} 
                />
              ))
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="p-12 text-center text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No upcoming rides</p>
                  <Link to={createPageUrl('Home')}>
                    <Button className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black">
                      Browse Rides
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* COMPLETED TAB CONTENT */}
          <TabsContent value="completed" className="space-y-4">
            {completedRides.length > 0 ? (
              completedRides.map(ride => (
                <RideItem 
                  key={getRideKey(ride, ride.host_driver_id === user.id)} 
                  ride={ride} 
                />
              ))
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="p-12 text-center text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No completed rides yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}