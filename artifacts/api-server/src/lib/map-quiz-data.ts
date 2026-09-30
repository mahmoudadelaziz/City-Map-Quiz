export type QuizOption = {
  id: string;
  label: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  kind: "street" | "landmark";
  targetLat: number;
  targetLng: number;
  options: QuizOption[];
  correctOptionId: string;
};

export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type QuizCity = {
  id: string;
  name: string;
  governorate: string;
  tagline: string;
  questionCount: number;
  mapBounds: MapBounds;
  questions: QuizQuestion[];
};

export const quizCities: QuizCity[] = [
  {
    id: "cairo",
    name: "Cairo",
    governorate: "Cairo Governorate",
    tagline: "Trace the heart of the capital",
    questionCount: 6,
    mapBounds: { north: 30.075, south: 30.02, east: 31.26, west: 31.2 },
    questions: [
      {
        id: "cairo-1",
        prompt: "Which landmark is marked?",
        kind: "landmark",
        targetLat: 30.0479664,
        targetLng: 31.2336093,
        options: [
          { id: "egyptian-museum", label: "The Egyptian Museum" },
          { id: "cairo-tower", label: "Cairo Tower" },
          { id: "opera-house", label: "Cairo Opera House" },
          { id: "abdeen-palace", label: "Abdeen Palace" },
        ],
        correctOptionId: "egyptian-museum",
      },
      {
        id: "cairo-2",
        prompt: "Which street is marked?",
        kind: "street",
        targetLat: 30.0505169,
        targetLng: 31.2404876,
        options: [
          { id: "talaat-harb", label: "Talaat Harb Street" },
          { id: "ramses-street", label: "Ramses Street" },
          { id: "qasr-el-ainy", label: "Qasr El Ainy Street" },
          { id: "salah-salem", label: "Salah Salem Street" },
        ],
        correctOptionId: "talaat-harb",
      },
      {
        id: "cairo-3",
        prompt: "Which landmark is marked?",
        kind: "landmark",
        targetLat: 30.0443934,
        targetLng: 31.2357457,
        options: [
          { id: "tahrir-square", label: "Tahrir Square" },
          { id: "opera-square", label: "Opera Square" },
          { id: "ramses-square", label: "Ramses Square" },
          { id: "abdel-moneim-riyad", label: "Abdel Moneim Riyad Square" },
        ],
        correctOptionId: "tahrir-square",
      },
      {
        id: "cairo-4",
        prompt: "Which landmark is marked?",
        kind: "landmark",
        targetLat: 30.0425838,
        targetLng: 31.2240718,
        options: [
          { id: "opera-house", label: "Cairo Opera House" },
          { id: "egyptian-museum", label: "The Egyptian Museum" },
          { id: "abdeen-palace", label: "Abdeen Palace" },
          { id: "cairo-tower", label: "Cairo Tower" },
        ],
        correctOptionId: "opera-house",
      },
      {
        id: "cairo-5",
        prompt: "Which landmark is marked?",
        kind: "landmark",
        targetLat: 30.0460136,
        targetLng: 31.2243131,
        options: [
          { id: "cairo-tower", label: "Cairo Tower" },
          { id: "cairo-university", label: "Cairo University" },
          { id: "gezira-sporting", label: "Gezira Sporting Club" },
          { id: "manial-palace", label: "Manial Palace" },
        ],
        correctOptionId: "cairo-tower",
      },
      {
        id: "cairo-6",
        prompt: "Which landmark is marked?",
        kind: "landmark",
        targetLat: 30.0427442,
        targetLng: 31.2473893,
        options: [
          { id: "abdeen-palace", label: "Abdeen Palace" },
          { id: "qasr-el-nil-bridge", label: "Qasr El Nil Bridge" },
          { id: "cairo-tower", label: "Cairo Tower" },
          { id: "egyptian-museum", label: "The Egyptian Museum" },
        ],
        correctOptionId: "abdeen-palace",
      },
    ],
  },
  {
    id: "alexandria",
    name: "Alexandria",
    governorate: "Alexandria Governorate",
    tagline: "Follow the coast through the city",
    questionCount: 6,
    mapBounds: { north: 31.25, south: 31.17, east: 29.96, west: 29.87 },
    questions: [
      {
        id: "alex-1",
        prompt: "Which landmark is marked?",
        kind: "landmark",
        targetLat: 31.2136787,
        targetLng: 29.8854132,
        options: [
          { id: "qaitbay", label: "Qaitbay Citadel" },
          { id: "montaza-palace", label: "Montaza Palace" },
          { id: "stanley-bridge", label: "Stanley Bridge" },
          { id: "pompeys-pillar", label: "Pompey's Pillar" },
        ],
        correctOptionId: "qaitbay",
      },
      {
        id: "alex-2",
        prompt: "Which street is marked?",
        kind: "street",
        targetLat: 31.2100093,
        targetLng: 29.8821356,
        options: [
          { id: "qaitbay-street", label: "Qaitbay Citadel Street" },
          { id: "corniche", label: "The Corniche" },
          { id: "abu-qir", label: "Abu Qir Street" },
          { id: "fouad", label: "Fouad Street" },
        ],
        correctOptionId: "qaitbay-street",
      },
      {
        id: "alex-3",
        prompt: "Which landmark is marked?",
        kind: "landmark",
        targetLat: 31.2086605,
        targetLng: 29.9089329,
        options: [
          { id: "bibliotheca", label: "Bibliotheca Alexandrina" },
          { id: "alexandria-station", label: "Misr Station" },
          { id: "qaitbay", label: "Qaitbay Citadel" },
          { id: "roman-theatre", label: "Roman Theatre" },
        ],
        correctOptionId: "bibliotheca",
      },
      {
        id: "alex-4",
        prompt: "Which landmark is marked?",
        kind: "landmark",
        targetLat: 31.2349967,
        targetLng: 29.9486108,
        options: [
          { id: "stanley-bridge", label: "Stanley Bridge" },
          { id: "qaitbay", label: "Qaitbay Citadel" },
          { id: "bibliotheca", label: "Bibliotheca Alexandrina" },
          { id: "montaza-palace", label: "Montaza Palace" },
        ],
        correctOptionId: "stanley-bridge",
      },
      {
        id: "alex-5",
        prompt: "Which landmark is marked?",
        kind: "landmark",
        targetLat: 31.2189912,
        targetLng: 29.942465,
        options: [
          { id: "sidi-gaber", label: "Sidi Gaber Station" },
          { id: "misr-station", label: "Misr Station" },
          { id: "stanley-bridge", label: "Stanley Bridge" },
          { id: "alexandria-zoo", label: "Alexandria Zoo" },
        ],
        correctOptionId: "sidi-gaber",
      },
      {
        id: "alex-6",
        prompt: "Which landmark is marked?",
        kind: "landmark",
        targetLat: 31.193363,
        targetLng: 29.9067595,
        options: [
          { id: "misr-station", label: "Misr Station" },
          { id: "sidi-gaber", label: "Sidi Gaber Station" },
          { id: "bibliotheca", label: "Bibliotheca Alexandrina" },
          { id: "qaitbay", label: "Qaitbay Citadel" },
        ],
        correctOptionId: "misr-station",
      },
    ],
  },
];