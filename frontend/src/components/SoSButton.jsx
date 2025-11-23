import React, { useState } from 'react';
import { AlertTriangle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SOSButton({ rideId, size = 'lg', className = '' }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [triggering, setTriggering] = useState(false);

  const triggerSOS = async () => {
    setTriggering(true);
    try {
      // 1. Authenticate user
      const user = await base44.auth.me();
      
      // 2. Get current location
      const position = await new Promise((resolve, reject) => {
        // Use timeout and maximumAge for a more resilient location attempt
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        });
      });

      const sosData = {
        user_id: user.id,
        ride_id: rideId,
        location: {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
          // Note: Reverse geocoding for 'address' would happen here via a separate API call
          address: 'Fetching...' 
        },
        sos_type: 'emergency',
        timestamp: new Date().toISOString(),
        contacts_notified: user.emergency_contacts?.map(c => c.phone) || []
      };

      // 3. Send SOS payload to the backend
      await base44.entities.SOS.create(sosData);
      
      // 4. Success Toast
      toast.success('SOS activated! Emergency contacts notified.', {
        duration: 5000,
        style: { background: '#dc2626', color: 'white' }
      });
      
      setShowConfirm(false);
    } catch (error) {
      // 5. Error Handling
      console.error('SOS Trigger Error:', error);
      toast.error('Failed to trigger SOS. Please ensure location is enabled.');
    } finally {
      setTriggering(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowConfirm(true)}
        // CORRECTION APPLIED HERE: Using backticks for template literal inside {}.
        className={`bg-yellow-400 hover:bg-yellow-500 text-black font-bold shadow-2xl border-4 border-black ${className}`}
        size={size}
      >
        <AlertTriangle className="w-6 h-6 mr-2 animate-pulse" />
        SOS EMERGENCY
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-red-50 border-4 border-red-600">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-8 h-8" />
              Trigger Emergency SOS?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-red-900">
              This will immediately:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Notify all your emergency contacts</li>
                <li>Share your live location</li>
                <li>Alert Carvezy safety team</li>
                <li>Log this incident for authorities</li>
              </ul>
              <p className="mt-3 font-semibold">Only use in genuine emergencies.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={triggering}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={triggerSOS}
              disabled={triggering}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Phone className="w-4 h-4 mr-2" />
              {triggering ? 'Activating...' : 'Yes, Trigger SOS'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}