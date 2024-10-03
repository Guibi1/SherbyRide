export type Profile = {
    cip: string;
    name: string;
    email: string;
    phone: string;
    faculty: Faculty;
};

export type Trajet = {
    id: number;
    departureLoc: string;
    arrivalLoc: string;
    departureTime: Date;
    maxPassengers: number;
    driver: Profile;
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
