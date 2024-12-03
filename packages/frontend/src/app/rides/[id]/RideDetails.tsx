"use client";

import ErrorOccured from "@/components/ErrorOccured";
import { Separator } from "@/components/ui/separator";
import { getRide } from "@/lib/api";
import type { Ride } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { CarFrontIcon, LocateIcon, MapPinIcon, StarIcon, UserIcon, UsersIcon } from "lucide-react";

export default function RideDetails(props: { ride: Ride }) {
    const { data: ride } = useQuery({
        queryKey: ["ride", props.ride.id.toString()],
        queryFn: () => getRide(props.ride.id.toString()),
        initialData: props.ride,
    });

    if (!ride || typeof ride === "string") {
        return (
            <main className="py-6 md:py-12 lg:py-16 xl:py-24">
                <ErrorOccured message={ride} />
            </main>
        );
    }

    return (
        <section className="flex flex-col gap-2">
            <div className="px-4 flex items-center gap-4">
                <LocateIcon className="h-7 w-7" />

                <div>
                    <p className="text-lg">
                        {ride.departureTime.toLocaleTimeString("fr-CA", { timeStyle: "short" })}
                        {" à "}
                        {ride.departureLoc}
                    </p>
                    <p className="text-muted-foreground">Adresse complete ici</p>
                </div>
            </div>

            <Separator orientation="horizontal" />

            <div className="px-4 flex items-center gap-4">
                <MapPinIcon className="h-7 w-7" />

                <div>
                    <p className="text-lg">{ride.arrivalLoc}</p>
                    <p className="text-muted-foreground">Adresse complete ici</p>
                </div>
            </div>

            <Separator orientation="horizontal" />

            <div className="px-4 flex items-center gap-4">
                <UsersIcon className="h-7 w-7" />

                <div>
                    <p className="text-lg">{ride.maxPassengers - ride.reservedSeats} places disponibles</p>
                    <p className="text-muted-foreground">Sur {ride.maxPassengers} places totales</p>
                </div>
            </div>

            {ride.request === "ACCEPTED" && (
                <>
                    <Separator orientation="horizontal" />

                    <div className="px-4 flex items-center gap-4">
                        <UserIcon className="h-7 w-7" />

                        <div>
                            <p className="text-lg">{ride.driver.name}</p>
                            <p className="text-muted-foreground">{ride.driver.faculty}</p>
                        </div>
                    </div>

                    <Separator orientation="horizontal" />

                    <div className="px-4 flex items-center gap-4">
                        <CarFrontIcon className="h-7 w-7" />

                        <div>
                            <p className="text-lg">
                                {ride.car.type} {ride.car.color.toLowerCase()}
                            </p>
                            <p className="text-muted-foreground">
                                {ride.car.model}, {ride.car.licencePlate}
                            </p>
                        </div>
                    </div>
                </>
            )}

            <Separator orientation="horizontal" />

            <div className="px-4 flex items-center gap-4">
                <StarIcon className="h-7 w-7" />

                <div>
                    <p className="text-lg">Conducteur {ride.ratings.average >= 3 ? "fiable" : "douteux"}</p>
                    <p className="text-muted-foreground">
                        Évaluation moyene de {ride.ratings.average} par {ride.ratings.count} personnes
                    </p>
                </div>
            </div>
        </section>
    );
}
