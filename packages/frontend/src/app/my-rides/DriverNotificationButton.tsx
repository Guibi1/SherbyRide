"use client";

import { Button } from "@/components/ui/button";
import { getRideRequests } from "@/lib/api";
import type { Ride } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";

export default function DriverNotificationButton({ ride }: { ride: Ride }) {
    const { data: pendingPassengers } = useQuery({
        queryKey: ["ride-requests"],
        queryFn: () => getRideRequests(ride),
    });

    if (typeof pendingPassengers === "string" || !pendingPassengers?.length) return null;

    return (
        <Button variant="outline" className="pointer-events-none bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <Bell className="mr-2 h-4 w-4" />
            Nouvelle demande !
        </Button>
    );
}
