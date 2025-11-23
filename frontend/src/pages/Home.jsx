import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, TrendingUp, Shield, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RideCard from '../components/rides/RideCard';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [rideType, setRideType] = useState('all');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: rides = [], isLoading } = useQuery({
    queryKey: ['rides', rideType],
    queryFn: async () => {
      const allRides = await base44.entities.Ride.filter(
        { status: 'scheduled', discoverable: true },
        '-start_time',
        50
      );
      
      // Filter by ride type
      if (rideType !== 'all') {
        return allRides.filter(r => r.ride_type === rideType);
      }
      return allRides;
    }
  });

  const { data: communities = [] } = useQuery({
    queryKey: ['communities'],
    queryFn: () => base44.entities.Community.list('-member_count', 10)
  });

  const filteredRides = rides.filter(ride => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ride.start_point?.address?.toLowerCase().includes(query) ||
      ride.destination?.address?.toLowerCase().includes(query)
    );
  });

  // Apply gender filtering
  const visibleRides = filteredRides.filter(ride => {
    if (ride.gender_preference === 'Female Only' && user?.gender === 'Male') {
      return false; // Hide from male users
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-black text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              Safe Rides, <span className="text-yellow-400">Shared Joy</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Community-first carpooling with safety at our core
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Where are you going?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-2 border-gray-200 focus:border-yellow-400 h-12 text-base"
                />
              </div>
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold h-12 px-6">
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
            <div className="bg-gray-900 rounded-xl p-4 text-center">
              <Shield className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-400">{user?.verified ? '✓' : '—'}</div>
              <div className="text-xs text-gray-400">Verified</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 text-center">
              <TrendingUp className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-400">{rides.length}</div>
              <div className="text-xs text-gray-400">Active Rides</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 text-center">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-400">{communities.length}</div>
              <div className="text-xs text-gray-400">Communities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Rides Section */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Available Rides</h2>
            <Tabs value={rideType} onValueChange={setRideType}>
              <TabsList className="bg-gray-100">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="carpool">Carpool</TabsTrigger>
                <TabsTrigger value="shared_cab">Shared Cab</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : visibleRides.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleRides.map(ride => (
                <RideCard key={ride.id} ride={ride} userGender={user?.gender} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No rides available yet</p>
              <p className="text-gray-400 text-sm mt-2">Be the first to create one!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}