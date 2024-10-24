export type Profile = {
    cip: string;
    name: string;
    email: string;
    phone: string;
    faculty: Faculty;
};

export type ProfileRatings = {
    average: number;
    count: number;
};

export type Ride = {
    id: number;
    departureLoc: string;
    arrivalLoc: string;
    departureTime: Date;
    maxPassengers: number;
    ratings: ProfileRatings;
};

export type Car = {
    licencePlate: string;
    type: string;
    model: string;
    year: number;
    color: Color;
};

export const faculties = [
    "Génie",
    "Droit",
    "École de gestion",
    "Éducation",
    "Lettres et sciences humaines",
    "Médecine et sciences de la santé",
    "Sciences",
    "Sciences de l'activité physique",
] as const;
export type Faculty = (typeof faculties)[number];

export const colors = ["Blanche", "Noire", "Grise", "Rouge", "Blue", "Verte", "Orange", "Beige"] as const;
export type Color = (typeof colors)[number];
