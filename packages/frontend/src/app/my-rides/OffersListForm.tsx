"use client";

import RideCard from "@/components/RideCard";
import { Button } from "@/components/ui/button";
import type { Ride } from "@/lib/types";
import Link from "next/link";

export default function OffersListForm({ rides }: { rides: Ride[] }) {
    return (
        <div className="container">
            <h1 className="text-xl font-semibold mb-4">Mes offres de covoiturage</h1>

            <div className="flex flex-col gap-4">
                {rides.map((ride) => (
                    <RideCard ride={ride} key={ride.id}>
                        <div className="flex justify-end gap-2">
                            <Button asChild>
                                <Link href={`/rides/${ride.id}`}>Voir les détails</Link>
                            </Button>

                            <Button variant="destructive">Supprimer l'offre</Button>
                        </div>
                    </RideCard>
                ))}

                {rides.length === 0 && <p>Aucune offre de covoiturage trouvée.</p>}
            </div>

            <Button className="mt-4" asChild>
                <Link href="/offers">Créer une nouvelle offre</Link>
            </Button>
        </div>
    );
}
