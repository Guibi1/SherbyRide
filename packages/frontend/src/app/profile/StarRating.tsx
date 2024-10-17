import type { ProfileRatings } from "@/lib/types";
import { StarIcon } from "lucide-react";

interface StarRatingProps {
    ratings: ProfileRatings;
    maxRating?: number;
    size?: number;
}

export default function StarRating({ ratings, maxRating = 5, size = 24 }: StarRatingProps) {
    return (
        <div className="flex gap-1 items-center">
            {[...Array(maxRating)].map((_, index) => (
                <StarIcon
                    key={index}
                    size={size}
                    className={index < ratings.average ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                />
            ))}
        </div>
    );
}
