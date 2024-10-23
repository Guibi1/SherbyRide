"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getSession } from "next-auth/react";
import { useForm } from "react-hook-form";

// Type importé à partir de votre module d'authentification
import type { User } from "@/lib/auth";
import router from "next/router";

type OffersListFormProps = {
    user: User; // Définition du type de la prop `user`
};

type Trajet = {
    id: string;
    departureLoc: string;
    arrivalLoc: string;
    departureTime: string;
    maxPassengers: number;
    // Ajoutez d'autres propriétés si nécessaire
};

export default function OffersListForm({ user }: OffersListFormProps) {
    const [trajets, setTrajets] = useState<Trajet[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTrajets = async () => {
            setLoading(true);
            try {
                const session = await getSession();
                const res = await fetch(`http://localhost:8080/trajet?driver=${user.cip}`, {
                    headers: { Authorization: `Bearer ${session?.accessToken}` },
                });
                if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);

                const data = await res.json();
                setTrajets(data);
            } catch (error) {
                toast.error("Erreur lors de la récupération des trajets", {
                    description: (error as Error).message,
                });
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
                            <CardTitle>Offre de Covoiturage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p><strong>Lieu de départ :</strong> {trajet.departureLoc}</p>
                            <p><strong>Destination :</strong> {trajet.arrivalLoc}</p>
                            <p>
                                <strong>Date et heure de départ :</strong>{" "}
                                {new Date(trajet.departureTime).toLocaleString(undefined, {
                                    dateStyle: "long",
                                    timeStyle: "short",
                                })}
                            </p>
                            <p><strong>Passagers max :</strong> {trajet.maxPassengers}</p>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <p>Aucune offre de covoiturage trouvée.</p>
            )}

            <Button className="mt-4" onClick={() => router.push("/trajet/new")}>
                Créer une nouvelle offre
            </Button>
        </div>
    );
}
