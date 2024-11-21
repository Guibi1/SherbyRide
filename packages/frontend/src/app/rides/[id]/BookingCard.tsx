"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { getSession, signIn } from "next-auth/react";
import { toast } from "sonner";

type BookingCardProps = { ride: string; profile: Profile | null };

export default function BookingCard({ ride, profile }: BookingCardProps) {
    const { mutate, isPending } = useMutation({
        async mutationFn() {
            const session = await getSession();
            const res = await fetch(`${process.env.API_BASE_URL}/trajet/${ride}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${session?.accessToken}`, "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
        },
        onSuccess() {
            toast.success("La demande a été envoyée");
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
                    {isPending ? "Réservation..." : "Demander une place"}
                </Button>
            </CardContent>
        </Card>
    );
}
