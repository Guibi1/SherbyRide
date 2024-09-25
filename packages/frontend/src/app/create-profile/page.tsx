import { getProfile } from "@/lib/api";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import ProfileCreationForm from "./ProfileCreationForm";

export default async function ProfileCreationPage() {
    const session = await auth();
    if (!session) notFound();

    const profile = await getProfile();
    if (profile) redirect("/");

    return (
        <main className="container my-8">
            <h1 className="scroll-m-20 mb-8 text-3xl font-semibold tracking-tight first:mt-0">
                Bienvenue sur SherbyRide
            </h1>

            <ProfileCreationForm user={session.user} />
        </main>
    );
}
