import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import OffersListForm from "./OffersListForm";

export default async function OffersListPage() {
    const session = await auth();
    if (!session) notFound();

    return (
        <div className="container mx-auto px-4 py-8">
            <OffersListForm user={session.user} />
        </div>
    );
}
