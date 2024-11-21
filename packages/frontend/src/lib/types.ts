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

export type RidePassenger = {
    id: number;
    ride: Ride;
    passenger: Profile;
    state: "PENDING" | "REFUSED" | "ACCEPTED";
};

type BaseRide = {
    id: number;
    departureLoc: string;
    arrivalLoc: string;
    departureTime: Date;
    maxPassengers: number;
    reservedSeats: number;
    ratings: ProfileRatings;
};
export type Ride =
    | (BaseRide & { request?: "PENDING" | "REFUSED" })
    | (BaseRide & { request: "MINE"; car: Car; passengers: RidePassenger[] })
    | (BaseRide & { request: "ACCEPTED"; car: Car; driver: Profile });


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

export const colors = ["Blanc", "Noir", "Gris", "Rouge", "Bleu", "Vert", "Orange", "Beige"] as const;
export type Color = (typeof colors)[number];

export const vehiculeTypes = ["VUS", "Berline", "Camion", "Mini-Van", "Camionnette"] as const;
export type VehiculeType = (typeof colors)[number];
