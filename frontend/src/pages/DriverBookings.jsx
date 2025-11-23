import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Users, MapPin, Clock, Phone, Mail, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format } from 'date-fns';

export default function DriverBookings() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const { data: myRides = [] } = useQuery({
    queryKey: ['my-hosted-rides', user?.id],
    queryFn: () => base44.entities.Ride.filter({ host_driver_id: user.id }, '-start_time'),
    enabled: !!user
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ['all-bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date', 100),
    enabled: myRides.length > 0
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
    enabled: allBookings.length > 0
  });

  const myRideIds = myRides.map(r => r.id);
  const bookingsForMyRides = allBookings.filter(b => myRideIds.includes(b.ride_id));

  const getRideBookings = (rideId) => {
    return bookingsForMyRides.filter(b => b.ride_id === rideId);
  };

  const getUserInfo = (userId) => {
    return allUsers.find(u => u.id === userId);
  };

  const upcomingRides = myRides.filter(r => r.status === 'scheduled');
  const ongoingRides = myRides.filter(r => r.status === 'ongoing');
  const completedRides = myRides.filter(r => r.status === 'completed');

  const RideWithBookings = ({ ride }) => {
    const bookings = getRideBookings(ride.id);
    
    return (
      <Card className="border-2 border-gray-200 hover:border-yellow-400 transition">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-lg flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 font-normal">
                {format(new Date(ride.start_time), 'MMM dd, h:mm a')}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-sm font-normal">{ride.start_point?.address}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-red-600" />
                <span className="text-sm font-normal">{ride.destination?.address}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-600">₹{ride.base_price}</div>
              <div className="text-xs text-gray-500">{bookings.length}/{ride.seat_capacity} booked</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {bookings.length > 0 ? (
            <div className="space-y-3">
              <div className="font-semibold text-sm text-gray-700 mb-3">Passengers ({bookings.length})</div>
              {bookings.map((booking) => {
                const passenger = getUserInfo(booking.user_id);
                if (!passenger) return null;
                
                return (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 bg-yellow-400 text-black border-2 border-black">
                        <AvatarFallback className="text-sm font-bold">
                          {passenger.full_name?.[0]?.toUpperCase() || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{passenger.full_name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {passenger.phone || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {passenger.email}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {passenger.gender} • {passenger.verified ? '✓ Verified' : 'Not verified'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Star className="w-3 h-3 fill-yellow-600" />
                        <span className="text-sm font-semibold">{passenger.rating?.toFixed(1)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {passenger.total_rides_as_rider} rides
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="pt-3 border-t mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Earnings:</span>
                  <span className="font-bold text-green-600">₹{bookings.length * ride.base_price}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No bookings yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My Rides & Bookings</h1>
          <p className="text-gray-600">Manage your rides and view passenger information</p>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList className="w-full bg-black mb-6">
            <TabsTrigger value="upcoming" className="flex-1 data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-yellow-400">
              Upcoming ({upcomingRides.length})
            </TabsTrigger>
            <TabsTrigger value="ongoing" className="flex-1 data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-yellow-400">
              Ongoing ({ongoingRides.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-yellow-400">
              Completed ({completedRides.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingRides.length > 0 ? (
              upcomingRides.map(ride => <RideWithBookings key={ride.id} ride={ride} />)
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="p-12 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No upcoming rides</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ongoing" className="space-y-4">
            {ongoingRides.length > 0 ? (
              ongoingRides.map(ride => <RideWithBookings key={ride.id} ride={ride} />)
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="p-12 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No ongoing rides</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedRides.length > 0 ? (
              completedRides.map(ride => <RideWithBookings key={ride.id} ride={ride} />)
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="p-12 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No completed rides</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}