import { auth } from "@/lib/auth";
import TrajetCreationForm from "./TrajetCreationForm";

export default async function OffersPage() {
    const session = await auth();

    return (
        <div className="container mx-auto px-4 py-8">
            <TrajetCreationForm user={session.user!} />
        </div>
    );
}
