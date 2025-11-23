import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { MapPin, Calendar, Users, DollarSign, Car, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CreateRide() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const { data: vehicles = [] } = useQuery({
    queryKey: ['user-vehicles', user?.id],
    queryFn: () => base44.entities.Vehicle.filter({ owner_user_id: user.id }),
    enabled: !!user
  });

  const [formData, setFormData] = useState({
    vehicle_id: '',
    start_point: { address: '', lat: 0, lon: 0 },
    destination: { address: '', lat: 0, lon: 0 },
    start_time: '',
    seat_capacity: 3,
    base_price: 200,
    ride_type: 'carpool',
    gender_preference: 'Anyone',
    visibility: 'public',
    driver_notes: ''
  });

  const createRideMutation = useMutation({
    mutationFn: async (rideData) => {
      if (!user?.verified) {
        throw new Error('You must be verified to create rides');
      }
      if (!user?.is_driver || vehicles.length === 0) {
        throw new Error('Please add a vehicle first');
      }

      const ride = {
        ...rideData,
        host_driver_id: user.id,
        seats_available: rideData.seat_capacity,
        status: 'scheduled',
        discoverable: true,
        estimated_distance_km: Math.random() * 50 + 5, // Mock
        estimated_duration_mins: Math.floor(Math.random() * 120 + 15) // Mock
      };

      return base44.entities.Ride.create(ride);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      toast.success('Ride created successfully!');
      navigate(createPageUrl('Home'));
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create ride');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.vehicle_id) {
      toast.error('Please select a vehicle');
      return;
    }
    if (!formData.start_point.address || !formData.destination.address) {
      toast.error('Please enter pickup and drop locations');
      return;
    }
    if (!formData.start_time) {
      toast.error('Please select departure time');
      return;
    }

    createRideMutation.mutate(formData);
  };

  if (!user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!user.verified) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Alert className="bg-yellow-50 border-yellow-400">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <AlertDescription className="text-yellow-900">
            You need to verify your identity before creating rides. Please complete your profile verification.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Create a Ride</h1>
          <p className="text-gray-600">Share your journey and save costs</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-2 border-gray-200">
            <CardHeader className="bg-black text-yellow-400">
              <CardTitle className="flex items-center gap-2">
                <Car className="w-6 h-6" />
                Ride Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Vehicle Selection */}
              <div>
                <Label>Select Vehicle</Label>
                <Select value={formData.vehicle_id} onValueChange={(v) => setFormData({...formData, vehicle_id: v})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose your vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.model} - {v.plate_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {vehicles.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">No vehicles found. Add one in your profile first.</p>
                )}
              </div>

              {/* Locations */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    Pickup Location
                  </Label>
                  <Input
                    placeholder="Enter pickup address"
                    value={formData.start_point.address}
                    onChange={(e) => setFormData({
                      ...formData,
                      start_point: { ...formData.start_point, address: e.target.value }
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
                    value={formData.destination.address}
                    onChange={(e) => setFormData({
                      ...formData,
                      destination: { ...formData.destination, address: e.target.value }
                    })}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Time and Seats */}
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
                    <Users className="w-4 h-4" />
                    Seats Available
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.seat_capacity}
                    onChange={(e) => setFormData({...formData, seat_capacity: parseInt(e.target.value)})}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Price */}
              <div>
                <Label className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Price per Seat (₹)
                </Label>
                <Input
                  type="number"
                  min="1"
                  step="0.5"
                  value={formData.base_price}
                  onChange={(e) => setFormData({...formData, base_price: parseFloat(e.target.value)})}
                  className="mt-1"
                />
              </div>

              {/* Ride Type */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Ride Type</Label>
                  <Select value={formData.ride_type} onValueChange={(v) => setFormData({...formData, ride_type: v})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="carpool">Carpool</SelectItem>
                      <SelectItem value="shared_cab">Shared Cab</SelectItem>
                    </SelectContent>
                  </Select>
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

              {/* Visibility */}
              <div>
                <Label>Visibility</Label>
                <Select value={formData.visibility} onValueChange={(v) => setFormData({...formData, visibility: v})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="community_only">Community Only</SelectItem>
                    <SelectItem value="invite_only">Invite Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div>
                <Label>Additional Notes (optional)</Label>
                <Textarea
                  placeholder="Any special instructions or preferences..."
                  value={formData.driver_notes}
                  onChange={(e) => setFormData({...formData, driver_notes: e.target.value})}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold h-12 text-lg"
                disabled={createRideMutation.isPending}
              >
                {createRideMutation.isPending ? 'Creating...' : 'Publish Ride'}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}