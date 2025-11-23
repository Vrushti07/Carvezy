import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { MapPin, Calendar, Users, DollarSign, Car, Share2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function SharedCabPost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const [formData, setFormData] = useState({
    cab_service: 'Uber',
    driver_contact: '',
    pickup_point: { address: '', lat: 0, lon: 0 },
    drop_point: { address: '', lat: 0, lon: 0 },
    start_time: '',
    total_cab_fare: 500,
    seats_offered: 2,
    gender_preference: 'Anyone',
    visibility: 'public'
  });

  const { data: sharedCabs = [] } = useQuery({
    queryKey: ['shared-cabs'],
    queryFn: () => base44.entities.SharedCab.filter({ status: 'open' }, '-start_time', 20)
  });

  const createSharedCabMutation = useMutation({
    mutationFn: async (cabData) => {
      if (!user?.verified) {
        throw new Error('You must be verified to post shared cabs');
      }

      const sharedCab = {
        ...cabData,
        host_user_id: user.id,
        seats_filled: 0,
        status: 'open',
        total_distance_km: Math.random() * 40 + 5,
        per_rider_share: []
      };

      return base44.entities.SharedCab.create(sharedCab);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-cabs'] });
      toast.success('Shared cab posted successfully!');
      navigate(createPageUrl('Home'));
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to post shared cab');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.pickup_point.address || !formData.drop_point.address) {
      toast.error('Please enter pickup and drop locations');
      return;
    }
    if (!formData.start_time || !formData.total_cab_fare) {
      toast.error('Please fill all required fields');
      return;
    }

    createSharedCabMutation.mutate(formData);
  };

  if (!user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Share Your Cab</h1>
              <p className="text-gray-600">Split the fare with fellow travelers</p>
            </div>

            <form onSubmit={handleSubmit}>
              <Card className="border-2 border-gray-200">
                <CardHeader className="bg-black text-yellow-400">
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-6 h-6" />
                    Cab Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div>
                    <Label>Cab Service</Label>
                    <Select value={formData.cab_service} onValueChange={(v) => setFormData({...formData, cab_service: v})}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Uber">Uber</SelectItem>
                        <SelectItem value="Lyft">Lyft</SelectItem>
                        <SelectItem value="Local Taxi">Local Taxi</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Driver Contact (optional)</Label>
                    <Input
                      placeholder="Driver's phone number"
                      value={formData.driver_contact}
                      onChange={(e) => setFormData({...formData, driver_contact: e.target.value})}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        Pickup Location
                      </Label>
                      <Input
                        placeholder="Enter pickup address"
                        value={formData.pickup_point.address}
                        onChange={(e) => setFormData({
                          ...formData,
                          pickup_point: { ...formData.pickup_point, address: e.target.value }
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-600" />
                        Drop Location
                      </Label>
                      <Input
                        placeholder="Enter destination"
                        value={formData.drop_point.address}
                        onChange={(e) => setFormData({
                          ...formData,
                          drop_point: { ...formData.drop_point, address: e.target.value }
                        })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Departure Time
                      </Label>
                      <Input
                        type="datetime-local"
                        value={formData.start_time}
                        onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Total Cab Fare (₹)
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        step="0.5"
                        value={formData.total_cab_fare}
                        onChange={(e) => setFormData({...formData, total_cab_fare: parseFloat(e.target.value)})}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Empty Seats to Share
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max="4"
                        value={formData.seats_offered}
                        onChange={(e) => setFormData({...formData, seats_offered: parseInt(e.target.value)})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Gender Preference</Label>
                      <Select value={formData.gender_preference} onValueChange={(v) => setFormData({...formData, gender_preference: v})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Anyone">Anyone</SelectItem>
                          <SelectItem value="Female Preferred">Female Preferred</SelectItem>
                          <SelectItem value="Female Only">Female Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-400">
                    <div className="text-sm font-semibold mb-1">Estimated Share per Rider:</div>
                    <div className="text-2xl font-bold text-yellow-600">
                      ₹{formData.total_cab_fare && formData.seats_offered 
                        ? (formData.total_cab_fare / (formData.seats_offered + 1)).toFixed(0)
                        : '0'}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Based on equal split ({formData.seats_offered + 1} people total)
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold h-12 text-lg"
                    disabled={createSharedCabMutation.isPending}
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    {createSharedCabMutation.isPending ? 'Posting...' : 'Post Shared Cab'}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </div>

          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Available Shared Cabs</h2>
              <p className="text-gray-600">Join existing shared rides</p>
            </div>

            <div className="space-y-4">
              {sharedCabs.map((cab) => (
                <Card key={cab.id} className="border-2 border-gray-200 hover:border-yellow-400 transition">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Car className="w-5 h-5 text-yellow-600" />
                        <span className="font-semibold">{cab.cab_service}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-yellow-600">
                          ₹{(cab.total_cab_fare / (cab.seats_offered + 1)).toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-500">per person</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>{cab.pickup_point?.address}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-red-600 mt-0.5" />
                        <span>{cab.drop_point?.address}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(cab.start_time).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {cab.seats_offered - cab.seats_filled} seats left
                      </div>
                    </div>

                    <Button
                      className="w-full bg-black hover:bg-gray-800 text-yellow-400 font-semibold"
                      size="sm"
                      disabled={cab.seats_filled >= cab.seats_offered}
                    >
                      {cab.seats_filled >= cab.seats_offered ? 'Full' : 'Join Ride'}
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {sharedCabs.length === 0 && (
                <Card className="bg-gray-50">
                  <CardContent className="p-12 text-center text-gray-500">
                    <Car className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No shared cabs available</p>
                    <p className="text-sm mt-2">Be the first to post one!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}