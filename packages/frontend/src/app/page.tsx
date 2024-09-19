import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/auth";
import { SearchIcon, UserIcon } from "lucide-react";

export default async function HomePage() {
    const session = await auth();

    return (
        <main className="flex-1">
            <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                                Find Your Perfect Ride {session?.user?.name}
                            </h1>

                            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                                Save money, reduce emissions, and make new friends. Join our carpool community today!
                            </p>
                        </div>
                        <div className="w-full max-w-sm space-y-2">
                            <form className="flex space-x-2">
                                <Input className="flex-1" placeholder="Enter your destination" type="text" />
                                <Button type="submit">
                                    <SearchIcon className="h-4 w-4" />
                                    <span className="sr-only">Search</span>
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
                <div className="container px-4 md:px-6">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Available Rides</h2>
                    <div className="grid gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((ride) => (
                            <Card key={ride}>
                                <CardHeader>
                                    <CardTitle>Ride to San Francisco</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">From: Los Angeles</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Date: June 15, 2023</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Time: 9:00 AM</p>
                                    <div className="flex items-center mt-4">
                                        <UserIcon className="h-4 w-4 mr-2" />
                                        <span className="text-sm font-medium">3 seats available</span>
                                    </div>
                                    <Button className="w-full mt-4">Book Now</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
