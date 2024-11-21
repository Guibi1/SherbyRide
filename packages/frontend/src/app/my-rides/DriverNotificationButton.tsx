"use client";

import { Button } from "@/components/ui/button";
import type { Ride } from "@/lib/types";
import { getRideRequests } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Bell, Check, X } from "lucide-react";
import { DialogHeader } from "@/components/ui/dialog";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function DriverNotificationButton({
	ride,
}: { ride: Ride }) {
    const {data: pendingPassengers, isPending} = useQuery({
      queryKey: ["ride-requests"],
      queryFn: () => getRideRequests(ride),
    });

    const handleNotificationClick = () => {
      //console.log(handleNotificationClick)
      alert("Un ou plusieurs passagers ont fait une demande pour ce trajet !");
    };

    if (isPending || typeof pendingPassengers ==="string" || !pendingPassengers?.length) return null;

    return (
<Dialog>
      <DialogTrigger asChild>
      <Button variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 mb-4">
      <Bell className="mr-2 h-4 w-4" />
      Nouvelle demande !
      </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Demandes de passagers</DialogTitle>
        </DialogHeader>
        <div className="h-[300px] w-full rounded-md border p-4">
          {pendingPassengers.map((passenger) => (
            <div key={passenger.cip} className="flex items-center justify-between py-2">
              <span>{passenger.name}</span>
              <div className="space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  //onClick={() => handleAccept(passenger.cip)}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Accepter
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  //onClick={() => handleReject(passenger.cip)}
                >
                  <X  />
                </Button>
              </div>
            </div>
          ))}
          {pendingPassengers.length === 0 && (
            <div className="text-center text-gray-500">
              Aucune demande en attente
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>



      // <Button variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 mb-4">
      // <Bell className="mr-2 h-4 w-4" />
      // Nouvelle demande !
      // </Button>
    );
}
