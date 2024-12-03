"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRide } from "@/lib/api";
import type { Profile, Ride } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckIcon, MailIcon, MessageCircleIcon, PhoneIcon, XIcon } from "lucide-react";
import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";

type BookingCardProps = { ride: Ride; profile: Profile | null };

export default function BookingCard({ profile, ...props }: BookingCardProps) {
    const { data: ride, refetch } = useQuery({
        queryKey: ["ride", props.ride.id.toString()],
        queryFn: () => getRide(props.ride.id.toString()),
        initialData: props.ride,
    });

    const { mutate: confirmReservation, isPending: confirmReservationPending } = useMutation({
        async mutationFn(values: { cip: string; accepted: boolean }) {
            const session = await getSession();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/trajet/${props.ride.id}/passengerRequest`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${session?.accessToken}`, "Content-Type": "application/json" },
                    body: JSON.stringify(values),
                },
            );
            if (!res.ok) throw `${res.status}: ${res.statusText}`;
        },
        onSuccess() {
            toast.success("Votre réponse a été envoyée");
            refetch();
        },
        onError(error) {
            toast.error("Une erreur est survenue", { description: error.message });
        },
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
                    <Button onClick={() => signIn("keycloak", { redirectTo: "/create-profile" })}>Se connecter</Button>
                </CardContent>
            </Card>
        );
    }

    if (ride.request === "MINE") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>État de votre trajet</CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col">
                    <p>Passagers</p>

                    <ul className="divide-y">
                        {ride.passengers.map((rp) => (
                            <li className="px-4 py-2 flex items-center justify-between" key={rp.passenger.cip}>
                                <div>{rp.passenger.name}</div>

                                {rp.state === "PENDING" && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                confirmReservation({ cip: rp.passenger.cip, accepted: true })
                                            }
                                            disabled={confirmReservationPending}
                                        >
                                            <CheckIcon />
                                            Accepter
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() =>
                                                confirmReservation({ cip: rp.passenger.cip, accepted: false })
                                            }
                                            disabled={confirmReservationPending}
                                        >
                                            <XIcon />
                                        </Button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
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
                    <p>Le conducteur a accepté votre demande de covoiturage!</p>
                    <p>
                        Assurez vous d'arriver au moins 15 minutes en avance au site de rendez-vous afin de ne pas
                        manquer votre lift.
                    </p>

                    <p className="mt-4">Contacter {ride.driver.name}</p>

                    <div className="flex gap-2 items-center justify-center">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={`tel:${ride.driver.phone}`}>
                                <PhoneIcon />
                            </Link>
                        </Button>

                        <Button variant="outline" size="icon" asChild>
                            <Link href={`sms:${ride.driver.phone}`}>
                                <MessageCircleIcon />
                            </Link>
                        </Button>

                        <Button variant="outline" size="icon" asChild>
                            <Link href={`mailto:${ride.driver.phone}`}>
                                <MailIcon />
                            </Link>
                        </Button>
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
