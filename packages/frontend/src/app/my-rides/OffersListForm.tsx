"use client";

import RideCard from "@/components/RideCard";
import { Button } from "@/components/ui/button";
import type { Ride } from "@/lib/types";
import Link from "next/link";

export default function OffersListForm({ rides }: { rides: Ride[] }) {
    // Filtrer les trajets selon le rôle de l'utilisateur
    const driverRides = rides.filter((ride) => ride.mine); // Trajets où l'utilisateur est conducteur
    const passengerRides = rides.filter((ride) => !ride.mine); // Trajets où l'utilisateur est passager

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
                                    <Button asChild>
                                        <Link href={`/rides/${ride.id}`}>Voir les détails</Link>
                                    </Button>
                                    <Button variant="destructive">Supprimer l'offre</Button>
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
