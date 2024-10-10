import { Star } from "lucide-react"

interface StarRatingProps {
    rating: number
    maxRating?: number
    size?: number
}

export default function StarRating({ rating, maxRating = 5, size = 24 }: StarRatingProps) {
    return (
        <div className="flex items-center">
            {[...Array(maxRating)].map((_, index) => (
                <Star
                    key={index}
                    size={size}
                    className={`${index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        } mr-1`}
                />
            ))}
        </div>
    )
}