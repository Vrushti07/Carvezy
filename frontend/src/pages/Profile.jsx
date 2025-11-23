import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User, Shield, Phone, Plus, Car, Star, Settings, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import GenderBadge from '../components/shared/GenderBadge';
import CommunityTag from '../components/shared/CommunityTag';

export default function Profile() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [profileData, setProfileData] = useState({
    phone: '',
    gender: 'Male',
    community_tags: []
  });

  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    phone: '',
    relation: ''
  });

  const [vehicleData, setVehicleData] = useState({
    plate_number: '',
    model: '',
    color: '',
    seat_capacity: 4,
    vehicle_type: 'Car'
  });

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setProfileData({
        phone: u.phone || '',
        gender: u.gender || 'Male',
        community_tags: u.community_tags || []
      });
    }).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const { data: vehicles = [] } = useQuery({
    queryKey: ['user-vehicles', user?.id],
    queryFn: () => base44.entities.Vehicle.filter({ owner_user_id: user.id }),
    enabled: !!user
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries();
      base44.auth.me().then(setUser);
      setEditing(false);
      toast.success('Profile updated!');
    }
  });

  const addVehicleMutation = useMutation({
    mutationFn: async (vehicle) => {
      const created = await base44.entities.Vehicle.create({
        ...vehicle,
        owner_user_id: user.id,
        verified: false
      });
      
      // Mark user as driver
      await base44.auth.updateMe({ is_driver: true });
      
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-vehicles'] });
      base44.auth.me().then(setUser);
      setShowAddVehicle(false);
      setVehicleData({ plate_number: '', model: '', color: '', seat_capacity: 4, vehicle_type: 'Car' });
      toast.success('Vehicle added!');
    }
  });

  const addEmergencyContact = () => {
    if (!emergencyContact.name || !emergencyContact.phone) {
      toast.error('Please fill all fields');
      return;
    }
    
    const contacts = user.emergency_contacts || [];
    updateProfileMutation.mutate({
      emergency_contacts: [...contacts, emergencyContact]
    });
    
    setEmergencyContact({ name: '', phone: '', relation: '' });
    setShowAddContact(false);
  };

  const handleVerificationUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      await base44.auth.updateMe({
        verification_evidence: file_url,
        verified: true
      });

      toast.success('Verification submitted! You are now verified.');
      base44.auth.me().then(setUser);
      setShowVerification(false);
    } catch (error) {
      toast.error('Failed to upload verification');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="border-2 border-yellow-400">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 bg-yellow-400 text-black border-4 border-black">
                  <AvatarFallback className="text-3xl font-bold">
                    {user.full_name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{user.full_name}</h1>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {user.verified ? (
                      <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                        <Shield className="w-4 h-4" />
                        Verified
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-orange-600 text-sm font-medium">
                        <AlertCircle className="w-4 h-4" />
                        Not Verified
                      </div>
                    )}
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                      {user.rating?.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setEditing(!editing)}
                variant="outline"
                size="sm"
                className="border-2 border-black"
              >
                <Settings className="w-4 h-4 mr-2" />
                {editing ? 'Cancel' : 'Edit'}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-black rounded-lg text-center">
              <div>
                <div className="text-2xl font-bold text-yellow-400">{user.total_rides_as_driver}</div>
                <div className="text-xs text-gray-400">As Driver</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{user.total_rides_as_rider}</div>
                <div className="text-xs text-gray-400">As Rider</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{vehicles.length}</div>
                <div className="text-xs text-gray-400">Vehicles</div>
              </div>
            </div>

            {/* Editable Fields */}
            {editing && (
              <div className="mt-6 pt-6 border-t space-y-4">
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="+1 234 567 8900"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select value={profileData.gender} onValueChange={(v) => setProfileData({...profileData, gender: v})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => updateProfileMutation.mutate(profileData)}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
                  disabled={updateProfileMutation.isPending}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Section */}
        {!user.verified && (
          <Card className="border-2 border-orange-400 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <AlertCircle className="w-5 h-5" />
                Account Verification Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-white border-orange-300">
                <AlertDescription className="text-orange-900">
                  You need to verify your identity to book rides, create rides, and access all features.
                  Please upload a photo of your ID (driver's license, passport, or government ID).
                </AlertDescription>
              </Alert>

              {!showVerification ? (
                <Button
                  onClick={() => setShowVerification(true)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Upload ID for Verification
                </Button>
              ) : (
                <div className="space-y-3">
                  <Label className="text-orange-900 font-semibold">Upload Your ID Document</Label>
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleVerificationUpload}
                    disabled={uploading}
                    className="cursor-pointer"
                  />
                  {uploading && (
                    <div className="text-sm text-orange-700">Uploading and verifying...</div>
                  )}
                  <Button
                    onClick={() => setShowVerification(false)}
                    variant="outline"
                    className="w-full"
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Community Tags */}
        {user.community_tags?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Communities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user.community_tags.map((tag, idx) => (
                  <CommunityTag key={idx} community={tag} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Emergency Contacts
              </span>
              <Button
                onClick={() => setShowAddContact(!showAddContact)}
                size="sm"
                variant="outline"
                className="border-2 border-black"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showAddContact && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <Input
                  placeholder="Contact Name"
                  value={emergencyContact.name}
                  onChange={(e) => setEmergencyContact({...emergencyContact, name: e.target.value})}
                />
                <Input
                  placeholder="Phone Number"
                  value={emergencyContact.phone}
                  onChange={(e) => setEmergencyContact({...emergencyContact, phone: e.target.value})}
                />
                <Input
                  placeholder="Relationship"
                  value={emergencyContact.relation}
                  onChange={(e) => setEmergencyContact({...emergencyContact, relation: e.target.value})}
                />
                <Button
                  onClick={addEmergencyContact}
                  className="w-full bg-black hover:bg-gray-800 text-yellow-400"
                >
                  Save Contact
                </Button>
              </div>
            )}

            {user.emergency_contacts?.map((contact, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-semibold">{contact.name}</div>
                  <div className="text-sm text-gray-600">{contact.phone}</div>
                  <div className="text-xs text-gray-500">{contact.relation}</div>
                </div>
                <Phone className="w-5 h-5 text-gray-400" />
              </div>
            ))}

            {(!user.emergency_contacts || user.emergency_contacts.length === 0) && !showAddContact && (
              <Alert className="bg-orange-50 border-orange-400">
                <AlertDescription className="text-orange-900">
                  Add emergency contacts for enhanced safety during rides
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Vehicles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                My Vehicles
              </span>
              <Button
                onClick={() => setShowAddVehicle(!showAddVehicle)}
                size="sm"
                className="bg-yellow-400 hover:bg-yellow-500 text-black"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Vehicle
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showAddVehicle && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <Input
                  placeholder="Plate Number"
                  value={vehicleData.plate_number}
                  onChange={(e) => setVehicleData({...vehicleData, plate_number: e.target.value})}
                />
                <Input
                  placeholder="Model (e.g., Toyota Camry)"
                  value={vehicleData.model}
                  onChange={(e) => setVehicleData({...vehicleData, model: e.target.value})}
                />
                <Input
                  placeholder="Color"
                  value={vehicleData.color}
                  onChange={(e) => setVehicleData({...vehicleData, color: e.target.value})}
                />
                <Input
                  type="number"
                  placeholder="Seat Capacity"
                  value={vehicleData.seat_capacity}
                  onChange={(e) => setVehicleData({...vehicleData, seat_capacity: parseInt(e.target.value)})}
                  min="2"
                  max="8"
                />
                <Button
                  onClick={() => addVehicleMutation.mutate(vehicleData)}
                  disabled={addVehicleMutation.isPending}
                  className="w-full bg-black hover:bg-gray-800 text-yellow-400"
                >
                  Register Vehicle
                </Button>
              </div>
            )}

            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-400 transition">
                <div>
                  <div className="font-semibold text-lg">{vehicle.model}</div>
                  <div className="text-sm text-gray-600">{vehicle.color} • {vehicle.plate_number}</div>
                  <div className="text-xs text-gray-500 mt-1">{vehicle.seat_capacity} seats • {vehicle.vehicle_type}</div>
                </div>
                <div className="text-right">
                  {vehicle.verified ? (
                    <div className="text-green-600 text-sm font-medium flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      Verified
                    </div>
                  ) : (
                    <div className="text-orange-600 text-sm">Pending</div>
                  )}
                </div>
              </div>
            ))}

            {vehicles.length === 0 && !showAddVehicle && (
              <div className="text-center py-8 text-gray-500">
                <Car className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No vehicles registered</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          onClick={() => base44.auth.logout(window.location.origin)}
          variant="outline"
          className="w-full border-2 border-red-600 text-red-600 hover:bg-red-50"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}