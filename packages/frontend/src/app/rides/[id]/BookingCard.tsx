"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getRide } from "@/lib/api";
import type { Profile, Ride } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CarFrontIcon, UserIcon } from "lucide-react";
import { getSession, signIn } from "next-auth/react";
import { toast } from "sonner";

type BookingCardProps = { ride: Ride; profile: Profile | null };

export default function BookingCard({ profile, ...props }: BookingCardProps) {
    const { data: ride, refetch } = useQuery({
        queryKey: ["ride", props.ride.id.toString()],
        queryFn: () => getRide(props.ride.id.toString()),
        initialData: props.ride,
    });

    const { mutate, isPending } = useMutation({
        async mutationFn() {
            const session = await getSession();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/trajet/${props.ride.id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${session?.accessToken}`, "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
        },
        onSuccess() {
            toast.success("La demande a été envoyée");
            refetch();
        },
        onError(error) {
            toast.error("Une erreur est survenue", { description: error.message });
        },
    });

    if (!ride || typeof ride === "string") return null;

    if (!profile) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Réserver une place</CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col gap-2 items-center">
                    <p>Un compte est nécessaire pour réserver une place</p>
                    <Button onClick={() => signIn("keycloak", { redirectTo: `/rides/${ride.id}` })}>
                        Se connecter
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (ride.request === "PENDING") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Réserver une place</CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col gap-2 items-center">
                    <p>Le conducteur n'a pas encore accepté votre demande</p>
                </CardContent>
            </Card>
        );
    }

    if (ride.request === "ACCEPTED") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Réserver une place</CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col gap-2 items-center">
                    <div className="text-center">
                        <p>Le conducteur a accepté votre demande de covoiturage!</p>
                        <p>
                            Assurez vous d'arriver au moins 15 minutes en avance au site de rendez-vous afin de ne pas
                            manquer votre lift.
                        </p>
                    </div>

                    <Separator orientation="horizontal" className="mt-4 max-w-80" />

                    <div className="px-4 flex items-center gap-4">
                        <UserIcon className="h-7 w-7" />

                        <div>
                            <p className="text-lg">{ride.driver.name}</p>
                            <p className="text-muted-foreground">{ride.driver.faculty}</p>
                            <p className="text-muted-foreground">
                                {ride.car.model}, {ride.car.licencePlate}
                            </p>
                        </div>
                    </div>

                    <Separator orientation="horizontal" className="max-w-80" />

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
                </CardContent>
            </Card>
        );
    }

    if (ride.request === "REFUSED") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Réserver une place</CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col gap-2 items-center">
                    <p>Le conducteur a refusé votre demande. Assurez-vous de réserver une autre offre.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Réserver une place</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-2 items-center">
                <p>Le conducteur devra accepter votre demande</p>
                <Button onClick={() => mutate()} disabled={isPending}>
                    {isPending ? "Réservation..." : "Demander une place"}
                </Button>
            </CardContent>
        </Card>
    );
}
