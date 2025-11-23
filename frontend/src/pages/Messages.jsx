import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, User, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Messages() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const { data: offers = [] } = useQuery({
    queryKey: ['my-offers', user?.id],
    queryFn: () => base44.entities.Offer.filter({ proposer_id: user.id }, '-created_date'),
    enabled: !!user
  });

  const { data: receivedOffers = [] } = useQuery({
    queryKey: ['received-offers', user?.id],
    queryFn: async () => {
      const myRides = await base44.entities.Ride.filter({ host_driver_id: user.id });
      const rideIds = myRides.map(r => r.id);
      
      const allOffers = await base44.entities.Offer.list('-created_date', 50);
      return allOffers.filter(o => rideIds.includes(o.ride_id));
    },
    enabled: !!user
  });

  if (!user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const allMessages = [
    ...offers.map(o => ({ ...o, type: 'sent' })),
    ...receivedOffers.map(o => ({ ...o, type: 'received' }))
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Messages & Offers</h1>
          <p className="text-gray-600">Negotiate and communicate</p>
        </div>

        {allMessages.length > 0 ? (
          <div className="space-y-4">
            {allMessages.map((msg) => (
              <Card key={msg.id} className="border-2 border-gray-200 hover:border-yellow-400 transition">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        msg.status === 'pending' ? 'bg-yellow-400' :
                        msg.status === 'accepted' ? 'bg-green-500' :
                        'bg-gray-400'
                      }`} />
                      <span className="font-semibold">
                        {msg.type === 'sent' ? 'Your Offer' : 'Offer Received'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.created_date).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-gray-500">Original Price</div>
                      <div className="font-bold text-gray-700">₹{msg.original_price}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Offered Price</div>
                      <div className="font-bold text-yellow-600">₹{msg.offered_amount}</div>
                    </div>
                  </div>

                  <div className="px-3 py-1 rounded-full text-xs font-medium w-fit capitalize" 
                    style={{
                      backgroundColor: 
                        msg.status === 'accepted' ? '#dcfce7' :
                        msg.status === 'rejected' ? '#fee2e2' :
                        msg.status === 'pending' ? '#fef3c7' :
                        '#f3f4f6',
                      color:
                        msg.status === 'accepted' ? '#166534' :
                        msg.status === 'rejected' ? '#991b1b' :
                        msg.status === 'pending' ? '#92400e' :
                        '#4b5563'
                    }}
                  >
                    {msg.status}
                  </div>

                  {msg.driver_response && (
                    <Alert className="mt-3 bg-blue-50 border-blue-200">
                      <AlertDescription className="text-blue-900 text-sm">
                        <strong>Response:</strong> {msg.driver_response}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-50">
            <CardContent className="p-12 text-center text-gray-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No messages yet</p>
              <p className="text-sm mt-2">Offers and negotiations will appear here</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}