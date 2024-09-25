import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CarIcon, SearchIcon, UserIcon } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
    return (
        <main>
            <section className="py-12 md:py-24 lg:py-32 xl:py-48">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                                Trouve ton trajet parfait
                            </h1>

                            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                                Économise de l'argent, réduit tes émissions et rencontre de nouveaux amis.
                            </p>
                        </div>

                        <form className="flex gap-2 w-full max-w-sm">
                            <Input className="flex-1" placeholder="Entre ta destination" type="text" />

                            <Button type="submit">
                                <SearchIcon className="h-4 w-4" />
                                <span className="sr-only">Recherche</span>
                            </Button>
                        </form>
                    </div>
                </div>
            </section>

            <section className="py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
                <div className="container px-4 md:px-6">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Trajets disponibles</h2>
                    <div className="grid gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((ride) => (
                            <Card key={ride}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        Sherbrooke <CarIcon size="1em" /> Montréal
                                    </CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Date: June 15, 2023</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Time: 9:00 AM</p>
                                    <div className="flex items-center mt-4">
                                        <UserIcon className="h-4 w-4 mr-2" />
                                        <span className="text-sm font-medium">3 places disponibles</span>
                                    </div>

                                    <Button className="w-full mt-4" asChild>
                                        <Link href={`/rides/${ride}`}>Réserver maintenant</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
