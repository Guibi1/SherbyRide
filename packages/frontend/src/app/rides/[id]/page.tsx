import ErrorOccured from "@/components/ErrorOccured";
import { Separator } from "@/components/ui/separator";
import { getProfile, getRide } from "@/lib/api";
import { CarFrontIcon, CarIcon, LocateIcon, MapPinIcon, StarIcon, UserIcon } from "lucide-react";
import BookingCard from "./BookingCard";

type RideDetailsProps = { params: { id: string } };

export default async function RideDetailsPage({ params }: RideDetailsProps) {
    const ride = await getRide(params.id);
    const profile = await getProfile();

    if (typeof ride === "string") {
        return (
            <main className="py-6 md:py-12 lg:py-16 xl:py-24">
                <ErrorOccured message={ride} />
            </main>
        );
    }

    return (
        <main className="container py-6 md:py-12 lg:py-16 xl:py-24">
            <div className="flex flex-col gap-2 pb-8">
                <h1 className="flex items-center gap-4 scroll-m-20 text-3xl font-semibold tracking-tight">
                    {ride.departureLoc} <CarIcon size="1em" /> {ride.arrivalLoc}
                </h1>

                <span className="text-lg">
                    {"Le "}
                    {ride.departureTime.toLocaleDateString("fr-CA", {
                        month: "long",
                        weekday: "long",
                        day: "numeric",
                    })}
                    {" à "}
                    {ride.departureTime.toLocaleTimeString("fr-CA", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </span>
            </div>

            <div className="grid gap-8 lg:gap-16 lg:grid-cols-2 items-start">
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
                        <UserIcon className="h-7 w-7" />

                        <div>
                            <p className="text-lg">{ride.maxPassengers} places disponibles</p>
                            <p className="text-muted-foreground">Sur {ride.maxPassengers} places totales</p>
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

                <BookingCard ride={params.id} profile={profile} />
            </div>
        </main>
    );
}
