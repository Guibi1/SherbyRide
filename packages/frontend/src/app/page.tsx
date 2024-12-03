import RideCard from "@/components/RideCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRides } from "@/lib/api";
import { SearchIcon } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
    const rides = await getRides({ from: "Sherbrooke" });

    return (
        <main className="flex flex-col">
            <section className="flex-1 grid py-12 md:py-24 lg:py-32 xl:py-48 container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                            Trouve ton trajet parfait
                        </h1>

                        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                            Économise de l'argent, réduit tes émissions et rencontre de nouveaux amis.
                        </p>
                    </div>

                    <form action="/rides" method="get" className="flex gap-2 w-full max-w-sm">
                        <Input name="to" className="flex-1" placeholder="Entre ta destination" type="text" />
                        <Button type="submit">
                            <SearchIcon className="h-4 w-4" />
                            <span className="sr-only">Recherche</span>
                        </Button>
                    </form>
                </div>
            </section>

            {typeof rides !== "string" && (
                <section className="py-12 md:py-24 lg:py-32 bg-primary/10 dark:bg-card">
                    <div className="container px-4 md:px-6">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                            Trajets disponibles
                        </h2>
                        <div className="grid gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-3">
                            {rides.map((ride) => (
                                <RideCard key={ride.id} ride={ride} className="bg-background">
                                    <Button className="w-full mt-4" asChild>
                                        <Link href={`/rides/${ride.id}`}>Réserver maintenant</Link>
                                    </Button>
                                </RideCard>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}
