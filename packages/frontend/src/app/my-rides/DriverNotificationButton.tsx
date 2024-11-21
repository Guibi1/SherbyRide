"use client";

import { Button } from "@/components/ui/button";
import type { Profile, Ride } from "@/lib/types";
import { getRideRequests } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Bell, Check, X } from "lucide-react";
import { DialogHeader } from "@/components/ui/dialog";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getSession } from "next-auth/react";
import { toast } from "sonner";

export default function DriverNotificationButton({
	ride,
}: { ride: Ride }) {
    const {data: pendingPassengers, refetch} = useQuery({
      queryKey: ["ride-requests"],
      queryFn: () => getRideRequests(ride),
    });

    const { mutate, isPending } = useMutation({
      async mutationFn(values: { cip: string, accepted:boolean}) {
          const session = await getSession();
          const res = await  fetch(`http://localhost:8080/trajet/${ride.id}/passengerRequest`, {
              method: "POST",
              headers: { Authorization: `Bearer ${session?.accessToken}`, "Content-Type": "application/json" },
              body: JSON.stringify(values),
          });
          if (!res.ok) throw `${res.status}: ${res.statusText}`;
          return (await res.json()) as Ride;
      },
      onSuccess(ride) {
          toast.success("Votre offre de trajet à été sauvegardé avec succès");
          refetch()
      },
      onError(error) {
          toast.error("Une erreur est survenue", { description: error.message });
          refetch()
      },
  });


    if (typeof pendingPassengers ==="string" || !pendingPassengers?.length) return null;

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
                  onClick={() => mutate({cip: passenger.cip, accepted:true})}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Accepter
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => mutate({cip: passenger.cip, accepted:false})}
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
    );
}
