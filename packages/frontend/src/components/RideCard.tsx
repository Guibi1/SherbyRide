import type { Ride } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CalendarClockIcon, CarIcon, UserIcon } from "lucide-react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const RideCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { ride: Ride }>(
    ({ ride, className, children, ...props }, ref) => (
        <Card ref={ref} className={cn("bg-background", className)} {...props}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    {ride.departureLoc} <CarIcon size="1em" /> {ride.arrivalLoc}
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <CalendarClockIcon className="h-4 w-4" strokeWidth={2.3} />
                    {"Le "}
                    {ride.departureTime.toLocaleDateString("fr-CA", {
                        month: "long",
                        weekday: "long",
                        day: "numeric",
                    })}
                    {" à "}
                    {ride.departureTime.toLocaleTimeString("fr-CA", {
                        timeStyle: "short",
                    })}
                </div>

                <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" strokeWidth={2.3} />
                    {ride.maxPassengers} places disponibles
                </div>

                {children}
            </CardContent>
        </Card>
    ),
);

RideCard.displayName = "RideCard";
export default RideCard;
