import ErrorOccured from "@/components/ErrorOccured";
import { getMyRides } from "@/lib/api";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import OffersListForm from "./OffersListForm";

export default async function OffersListPage() {
    const session = await auth();
    if (!session) notFound();
    const rides = await getMyRides();

    if (typeof rides === "string") {
        return (
            <main className="py-6 md:py-12 lg:py-16 xl:py-24 bg-gray-100 dark:bg-gray-800">
                <ErrorOccured message={rides} />
            </main>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <OffersListForm rides={rides} />
        </div>
    );
}
