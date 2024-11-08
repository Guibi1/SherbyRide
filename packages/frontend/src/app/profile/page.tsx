import ErrorOccured from "@/components/ErrorOccured";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCars, getProfile } from "@/lib/api";
import { getQueryClient } from "@/lib/query";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import CarsList from "./CarsList";
import ProfileForm from "./ProfileForm";
import StarRating from "./StarRating";

export default async function ProfilePage() {
    const profile = await getProfile(true);
    if (!profile) redirect("/");

    const cars = await getCars();
    if (typeof cars === "string") {
        return (
            <main className="container my-8">
                <ErrorOccured message={cars} />
            </main>
        );
    }

    const queryClient = getQueryClient();
    await queryClient.prefetchQuery({
        queryKey: ["user-cars"],
        initialData: cars,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <main className="container my-8">
                <h1 className="scroll-m-20 mb-8 text-3xl font-semibold tracking-tight first:mt-0">Mon profil</h1>

                <div className="flex flex-col md:flex-row gap-4 md:gap-8 lg:gap-16">
                    <Card className="min-w-60">
                        <CardHeader>
                            <Avatar className="mx-auto w-24 h-24">
                                {/* <AvatarImage src={user.image!} alt={user.name!} /> */}
                                <AvatarFallback>
                                    {profile.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("") || "?"}
                                </AvatarFallback>
                            </Avatar>
                        </CardHeader>

                        <CardContent>
                            <CardTitle>{profile.name}</CardTitle>
                            <CardDescription>{profile.cip}</CardDescription>

                            <p className="pt-4 pb-1">Ma note</p>
                            <StarRating ratings={profile.ratings} />

                            <p className="pt-4 pb-1">Mes voitures</p>
                            <CarsList />
                        </CardContent>
                    </Card>

                    <ProfileForm profile={profile} />
                </div>
            </main>
        </HydrationBoundary>
    );
}
