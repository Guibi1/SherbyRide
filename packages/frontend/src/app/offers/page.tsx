import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import TrajetCreationForm from "./TrajetCreationForm";

export default async function OffersPage() {
    const session = await auth();
    if (!session) notFound();

    return (
        <div className="container mx-auto px-4 py-8">
            <TrajetCreationForm user={session.user} />
        </div>
    );
}
