"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/auth";

// Définition du type pour un trajet
interface Trajet {
    id: string;
    departureLoc: string;
    arrivalLoc: string;
    departureTime: string;
    maxPassengers: number;
}

export default function MesTrajets({ user }: { user: User }) {
    const [trajets, setTrajets] = useState<Trajet[]>([]); // Typage des trajets
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

                const data: Trajet[] = await res.json(); // Spécifiez que data est un tableau de Trajet
                setTrajets(data);
            } catch (error: unknown) {
                // Typage de l'erreur comme 'unknown'
                if (error instanceof Error) {
                    toast.error("Erreur lors de la récupération des trajets", { description: error.message });
                } else {
                    toast.error("Une erreur inconnue est survenue.");
                }
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
                trajets.map((trajet) => {
                    // Utilisation de useForm pour chaque trajet
                    const form = useForm({
                        defaultValues: {
                            from: trajet.departureLoc,
                            to: trajet.arrivalLoc,
                            date: new Date(trajet.departureTime).toLocaleString(undefined, {
                                dateStyle: "long",
                                timeStyle: "short",
                            }),
                            passengers: trajet.maxPassengers.toString(),
                        },
                    });

                    return (
                        <Form key={trajet.id} {...form}>
                            <form className="flex flex-col gap-4 mb-6">
                                <FormField
                                    control={form.control}
                                    name="from"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Lieu de départ</FormLabel>
                                            <FormControl>
                                                <Input {...field} disabled />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="to"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Destination</FormLabel>
                                            <FormControl>
                                                <Input {...field} disabled />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date et heure de départ</FormLabel>
                                            <FormControl>
                                                <Input {...field} disabled />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="passengers"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Passagers max</FormLabel>
                                            <FormControl>
                                                <Input {...field} disabled />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                    );
                })
            ) : (
                <p>Aucune offre de covoiturage trouvée.</p>
            )}

            <Button className="mt-4" onClick={() => router.push("/offers")}>
                Créer une nouvelle offre
            </Button>
        </div>
    );
}
