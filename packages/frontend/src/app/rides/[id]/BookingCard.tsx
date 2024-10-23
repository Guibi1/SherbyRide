"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { ScanFaceIcon } from "lucide-react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type BookingCardProps = { ride: string; profile: Profile | null; onReservationSuccess: (rideId: string) => void };

export default function BookingCard({ ride, profile, onReservationSuccess }: BookingCardProps) {
    const router = useRouter();
    const { mutate, isPending } = useMutation({
        async mutationFn() {
            const session = await getSession();
            const res = await fetch(`http://localhost:8080/trajet/${ride}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${session?.accessToken}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    // cip: profile?.cip
                }),
            });
            if (!res.ok) throw `${res.status}: ${res.statusText}`;
        },
        onSuccess() {
            toast.success("La demande a été envoyée");
            onReservationSuccess(ride);  // Met à jour la page des trajets pour indiquer que l'offre a été réservée
            router.push("/rides");
        },
        onError(error) {
            toast.error("Une erreur est survenue", { description: error.message });
        },
    });

    if (!profile) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Réserver une place</CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col gap-2 items-center">
                    <ScanFaceIcon className="h-20 w-20 m-2 text-muted-foreground" />

                    <p>Un compte est nécessaire pour réserver une place</p>

                    <Button onClick={() => signIn("keycloak", { redirectTo: `/rides/${ride}` })}>Se connecter</Button>
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
                    {isPending ? "Demande en cours..." : "Demander une place"}
                </Button>
            </CardContent>
        </Card>
    );
}