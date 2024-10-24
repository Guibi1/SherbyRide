import ErrorOccured from "@/components/ErrorOccured";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCars, getProfile } from "@/lib/api";
import { redirect } from "next/navigation";
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

    return (
        <main className="container my-8">
            <h1 className="scroll-m-20 mb-8 text-3xl font-semibold tracking-tight first:mt-0">Mon profil</h1>

            <div className="flex gap-4 md:gap-8 lg:gap-16">
                <Card>
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

                        <p className="pt-4">Ma note</p>
                        <StarRating ratings={profile.ratings} />

                        <p className="pt-4">Mes voitures</p>
                        {cars.map((car) => (
                            <div key={car.licencePlate}>{car.model}</div>
                        ))}
                    </CardContent>
                </Card>

                <ProfileForm profile={profile} />
            </div>
        </main>
    );
}
