import { getProfile } from "@/lib/api";
import { redirect } from "next/navigation";
import ProfileCreationForm from "./ProfileCreationForm";

export default async function ProfilePage() {
    const profile = await getProfile();
    if (!profile) redirect("/");

    return (
        <main className="container my-8">
            <h1 className="scroll-m-20 mb-8 text-3xl font-semibold tracking-tight first:mt-0">Mon profil</h1>

            <ProfileCreationForm profile={profile} />
        </main>
    );
}
