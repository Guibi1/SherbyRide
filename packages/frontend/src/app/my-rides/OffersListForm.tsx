"use client";

import ErrorOccured from "@/components/ErrorOccured";
import RatingDialog from "@/components/RatingDialog";
import RideCard from "@/components/RideCard";
import { Button } from "@/components/ui/button";
import { getMyRides } from "@/lib/api";
import type { MyRide } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BellIcon, PlusIcon } from "lucide-react";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";

export default function OffersListForm(props: { rides: MyRide[] }) {
    const { data: rides, refetch } = useQuery({
        queryKey: ["my-rides"],
        queryFn: getMyRides,
        initialData: props.rides,
    });

    const { mutate, isPending } = useMutation({
        async mutationFn(id: number) {
            const session = await getSession();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/trajet/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${session?.accessToken}`, "Content-Type": "application/json" },
            });
            if (!res.ok) throw `${res.status}: ${res.statusText}`;
        },
        onSuccess() {
            toast.success("Votre offre de trajet à été supprimée avec succès");
            refetch();
        },
        onError(error) {
            toast.error("Une erreur est survenue", { description: error.message });
        },
    });

    if (typeof rides === "string") {
        return (
            <main className="py-6 md:py-12 lg:py-16 xl:py-24 bg-gray-100 dark:bg-gray-800">
                <ErrorOccured message={rides} />
            </main>
        );
    }

    const driverRides = rides.filter((ride) => "requests" in ride); // Trajets où l'utilisateur est conducteur
    const passengerRides = rides.filter((ride) => "rated" in ride); // Trajets où l'utilisateur est passager

    return (
        <div className="container">
            <h1 className="text-xl font-semibold mb-4">Mes trajets de covoiturage</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Colonne de gauche : Trajets où l'utilisateur est conducteur */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">Mes offres</h2>
                    <div className="flex flex-col gap-4">
                        {driverRides.map((ride) => (
                            <RideCard ride={ride} key={ride.id}>
                                <div className="flex justify-end gap-2">
                                    {ride.requests && <Button variant="outline" className="pointer-events-none bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                                        <BellIcon className="mr-2 h-4 w-4" />
                                        Nouvelle demande !
                                    </Button>}

                                    <Button asChild>
                                        <Link href={`/rides/${ride.id}`}>Voir les détails</Link>
                                    </Button>

                                    <Button variant="destructive" disabled={isPending} onClick={() => mutate(ride.id)}>
                                        Supprimer l'offre
                                    </Button>
                                </div>
                            </RideCard>
                        ))}
                        {driverRides.length === 0 && <p>Aucune offre de covoiturage trouvée.</p>}
                    </div>
                </div>

                {/* Colonne de droite : Trajets où l'utilisateur est passager */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">Trajets où je suis passager</h2>
                    <div className="flex flex-col gap-4">
                        {passengerRides.map((ride) => (
                            <RideCard ride={ride} key={ride.id}>
                                <div className="flex justify-end gap-2">
                                    <Button asChild>
                                        <Link href={`/rides/${ride.id}`}>Voir les détails</Link>
                                    </Button>

                                    {!ride.rated && ride.driver && (
                                        <RatingDialog ride={ride}>
                                            <Button
                                                className="relative rounded-sm justify-start font-normal py-1.5 pr-2 pl-8 text-sm outline-none"
                                                variant="ghost"
                                            >
                                                <PlusIcon
                                                    size={12}
                                                    className="stroke-muted-foreground absolute left-2"
                                                />
                                                Note le conducteur
                                            </Button>
                                        </RatingDialog>
                                    )}
                                </div>
                            </RideCard>
                        ))}
                        {passengerRides.length === 0 && <p>Aucun trajet comme passager trouvé.</p>}
                    </div>
                </div>
            </div>

            <Button className="mt-4" asChild>
                <Link href="/offers">Créer une nouvelle offre</Link>
            </Button>
        </div>
    );
}
