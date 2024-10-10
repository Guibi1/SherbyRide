import { getProfile } from "@/lib/api";
import { getRating } from "@/lib/api";
import { redirect } from "next/navigation";
import ProfileCreationForm from "./ProfileCreationForm";
import StarRating from "./StarRating";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ProfilePage() {
    const profile = await getProfile();
    if (!profile) redirect("/");
    const rating = await getRating(profile.cip);

    return (
        <main className="container my-8">
            <h1 className="scroll-m-20 mb-8 text-3xl font-semibold tracking-tight first:mt-0">Mon profil</h1>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Ma note</CardTitle>
                </CardHeader>
                <CardContent>
                    <StarRating rating={rating} />
                </CardContent>
            </Card>

            <ProfileCreationForm profile={profile} />
        </main>
    );
}
