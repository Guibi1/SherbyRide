import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type GetRidesOptions, getRides } from "@/lib/api";
import { CarFrontIcon, CarIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import RideFilter from "./RideFilter";

type PageProps = { searchParams: GetRidesOptions };

export default async function RidesPage({ searchParams }: PageProps) {
    const rides = await getRides(searchParams);

    return (
        <main className="py-6 md:py-12 lg:py-16 xl:py-24 bg-gray-100 dark:bg-gray-800">
            <div className="container">
                <h1 className="text-3xl font-bold tracking-tighter mb-4">Trouver un covoiturage</h1>

                <div className="grid gap-6 md:grid-cols-4">
                    <RideFilter initial={searchParams} />

                    <section className="md:col-span-3">
                        <div className="grid gap-6">
                            {rides.map((ride) => (
                                <Card key={ride.id} className="bg-background">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            {ride.departureLoc} <CarIcon size="1em" /> {ride.arrivalLoc}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Date:{" "}
                                            {ride.departureTime.toLocaleDateString("fr-CA", {
                                                month: "long",
                                                day: "numeric",
                                            })}{" "}
                                            à{" "}
                                            {ride.departureTime.toLocaleTimeString("fr-CA", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>

                                        <div className="flex items-center mt-4">
                                            <UserIcon className="h-4 w-4 mr-2" />
                                            <span className="text-sm font-medium">
                                                {ride.maxPassengers} places disponibles
                                            </span>
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
                    </section>
                </div>
            </div>
        </main>
    );
}
