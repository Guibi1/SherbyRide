"use client";

import { Button } from "@/components/ui/button";
import type { Ride } from "@/lib/types";
import { getRideRequests } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

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
      <Button variant="outline" className="mb-4">
        Notifications passagers
      </Button>
    );
}
