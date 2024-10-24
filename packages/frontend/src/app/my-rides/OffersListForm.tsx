"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/lib/auth";
import type { Ride } from "@/lib/types";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function OffersListForm({ user }: { user: User }) {
    // Spécifier que trajets est un tableau d'objets de type Trajet
    const [trajets, setTrajets] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchTrajets = async () => {
            setLoading(true);
            try {
                const session = await getSession();
                const res = await fetch(`http://localhost:8080/trajet?driver=${user.cip}`, {
                    headers: { Authorization: `Bearer ${session?.accessToken}` },
                });
                if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);

                const data: Ride[] = await res.json(); // Le tableau des trajets récupérés
                setTrajets(data);
            } catch (error) {
                toast.error("Erreur lors de la récupération des trajets", { description: (error as Error).message });
            } finally {
                setLoading(false);
            }
        };

        fetchTrajets();
    }, [user.cip]);

    return (
        <div className="container">
            <h1 className="text-xl font-semibold mb-4">Mes offres de covoiturage</h1>
            {loading ? (
                <p>Chargement...</p>
            ) : trajets.length > 0 ? (
                trajets.map((trajet) => (
                    <Card key={trajet.id} className="mb-4">
                        <CardHeader>
                            <CardTitle>Offre de covoiturage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <strong>Lieu de départ: </strong>
                                {trajet.departureLoc}
                            </div>
                            <div>
                                <strong>Destination: </strong>
                                {trajet.arrivalLoc}
                            </div>
                            <div>
                                <strong>Date et heure: </strong>
                                {new Date(trajet.departureTime).toLocaleString()}
                            </div>
                            <div>
                                <strong>Passagers max: </strong>
                                {trajet.maxPassengers}
                            </div>
                            <div>
                                <strong>Sièges réservés: </strong>
                                {trajet.reservedSeats}
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <p>Aucune offre de covoiturage trouvée.</p>
            )}

            <Button className="mt-4" onClick={() => router.push("/offers")}>
                Créer une nouvelle offre
            </Button>
        </div>
    );
}
