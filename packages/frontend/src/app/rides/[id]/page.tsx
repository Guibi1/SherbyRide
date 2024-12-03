import ErrorOccured from "@/components/ErrorOccured";
import { getProfile, getRide } from "@/lib/api";
import { CarIcon } from "lucide-react";
import BookingCard from "./BookingCard";
import RideDetails from "./RideDetails";

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
                <RideDetails ride={ride} />

                <BookingCard ride={ride} profile={profile} />
            </div>
        </main>
    );
}
