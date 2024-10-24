"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Ride } from "@/lib/types";
import Link from "next/link";

export default function OffersListForm({ rides }: { rides: Ride[] }) {
    return (
        <div className="container">
            <h1 className="text-xl font-semibold mb-4">Mes offres de covoiturage</h1>

            {rides.map((ride) => (
                <Card key={ride.id} className="mb-4">
                    <CardHeader>
                        <CardTitle>Offre de covoiturage</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div>
                            <strong>Lieu de départ: </strong>
                            {ride.departureLoc}
                        </div>
                        <div>
                            <strong>Destination: </strong>
                            {ride.arrivalLoc}
                        </div>
                        <div>
                            <strong>Date et heure: </strong>
                            {new Date(ride.departureTime).toLocaleString()}
                        </div>
                        <div>
                            <strong>Passagers max: </strong>
                            {ride.maxPassengers}
                        </div>
                        <div>
                            <strong>Sièges réservés: </strong>
                            {ride.reservedSeats}
                        </div>
                    </CardContent>
                </Card>
            ))}

            {rides.length === 0 && <p>Aucune offre de covoiturage trouvée.</p>}

            <Button className="mt-4" asChild>
                <Link href="/offers">Créer une nouvelle offre</Link>
            </Button>
        </div>
    );
}
