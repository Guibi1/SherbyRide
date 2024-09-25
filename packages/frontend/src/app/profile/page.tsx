import { getProfile } from "@/lib/api";
import Form from "./form";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const profile = await getProfile();
    if (!profile) redirect("/");

    return (
        <main className="container my-8">
            <h1 className="scroll-m-20 mb-8 text-3xl font-semibold tracking-tight first:mt-0">Mon profil</h1>

            <Form profile={profile} />
        </main>
    );
}
