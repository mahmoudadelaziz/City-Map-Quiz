export type QuizOption = {
  id: string;
  label: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  kind: "street" | "landmark";
  targetX: number;
  targetY: number;
  options: QuizOption[];
  correctOptionId: string;
};

export type QuizCity = {
  id: string;
  name: string;
  governorate: string;
  tagline: string;
  questionCount: number;
  questions: QuizQuestion[];
};

export const quizCities: QuizCity[] = [
  {
    id: "cairo",
    name: "Cairo",
    governorate: "Cairo Governorate",
    tagline: "Trace the heart of the capital",
    questionCount: 6,
    questions: [
      {
        id: "cairo-1",
        prompt: "Which landmark is marked?",
        kind: "landmark",
        targetX: 57,
        targetY: 39,
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
        targetX: 68,
        targetY: 55,
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
        targetX: 63,
        targetY: 44,
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
        prompt: "Which street is marked?",
        kind: "street",
        targetX: 75,
        targetY: 36,
        options: [
          { id: "26-july", label: "26th of July Street" },
          { id: "mohamed-farid", label: "Mohamed Farid Street" },
          { id: "el-gomhoreya", label: "El Gomhoreya Street" },
          { id: "el-tahrir", label: "El Tahrir Street" },
        ],
        correctOptionId: "26-july",
      },
      {
        id: "cairo-5",
        prompt: "Which landmark is marked?",
        kind: "landmark",
        targetX: 37,
        targetY: 57,
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
        targetX: 48,
        targetY: 48,
        options: [
          { id: "qasr-el-nil-bridge", label: "Qasr El Nil Bridge" },
          { id: "6-october-bridge", label: "6th of October Bridge" },
          { id: "abbas-bridge", label: "Abbas Bridge" },
          { id: "imbaba-bridge", label: "Imbaba Bridge" },
        ],
        correctOptionId: "qasr-el-nil-bridge",
      },
    ],
  },
  {
    id: "alexandria",
    name: "Alexandria",
    governorate: "Alexandria Governorate",
    tagline: "Follow the coast through the city",
    questionCount: 6,
    questions: [
      {
        id: "alex-1",
        prompt: "Which landmark is marked?",
        kind: "landmark",
        targetX: 25,
        targetY: 39,
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
        targetX: 60,
        targetY: 42,
        options: [
          { id: "corniche", label: "The Corniche" },
          { id: "abu-qir", label: "Abu Qir Street" },
          { id: "fouad", label: "Fouad Street" },
          { id: "el-horreya", label: "El Horreya Road" },
        ],
        correctOptionId: "corniche",
      },
      {
        id: "alex-3",
        prompt: "Which landmark is marked?",
        kind: "landmark",
        targetX: 38,
        targetY: 45,
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
        targetX: 78,
        targetY: 49,
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
        targetX: 58,
        targetY: 66,
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
        targetX: 43,
        targetY: 61,
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