import ErrorOccured from "@/components/ErrorOccured";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type GetRidesOptions, getRides } from "@/lib/api";
import { CalendarClockIcon, CarFrontIcon, CarIcon, CircleOffIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import RideFilter from "./RideFilter";

type PageProps = { searchParams: GetRidesOptions };

export default async function RidesPage({ searchParams }: PageProps) {
    const rides = await getRides(searchParams);
    console.log("🚀 ~ RidesPage ~ rides:", rides);

    if (typeof rides === "string") {
        return (
            <main className="py-6 md:py-12 lg:py-16 xl:py-24 bg-gray-100 dark:bg-gray-800">
                <ErrorOccured message={rides} />
            </main>
        );
    }

    return (
        <main className="py-6 md:py-12 lg:py-16 xl:py-24 bg-gray-100 dark:bg-gray-800">
            <div className="container flex flex-col md:flex-row gap-16">
                <div className="flex flex-col md:w-80">
                    <h1 className="text-3xl font-bold tracking-tighter mb-4">Trouver un covoiturage</h1>

                    <RideFilter initial={searchParams} />
                </div>

                <div className="flex-1 flex flex-col gap-6">
                    {rides.map((ride) => (
                        <Card key={ride.id} className="bg-background">
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

                                <Button className="w-full mt-4" asChild>
                                    <Link href={`/rides/${ride.id}`}>Réserver maintenant</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}

                    {rides.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-2">
                            <CarFrontIcon className="h-32 w-32 text-muted-foreground" />
                            <p className="text-xl font-semibold">Oh oh.</p>
                            <p>Aucune offre de covoiturage avec vos critères n'a été trouvée</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
