import { SurveyQuestion } from '../types';

// Dog survey questions (from survey.json)
export const DOG_SURVEY: SurveyQuestion[] = [
  {
    questionId: "energy_1",
    question: "How active is your dog during the day?",
    category: "energy",
    options: [
      "Very active - always moving",
      "Moderately active",
      "Somewhat lazy",
      "Very lazy - sleeps most of the day"
    ],
    weights: [1.0, 0.7, 0.4, 0.1],
    required: true,
    description: "This helps determine your dog's energy level and exercise needs"
  },
  {
    questionId: "social_1",
    question: "How does your dog interact with other animals?",
    category: "social",
    options: [
      "Very friendly and playful",
      "Generally friendly",
      "Neutral or indifferent",
      "Aggressive or fearful"
    ],
    weights: [1.0, 0.7, 0.4, 0.1],
    required: true,
    description: "This helps understand social behavior and training needs"
  },
  {
    questionId: "intelligence_1",
    question: "How quickly does your dog learn new commands?",
    category: "intelligence",
    options: [
      "Learns very quickly (1-3 attempts)",
      "Learns quickly (4-7 attempts)",
      "Takes time to learn (8-15 attempts)",
      "Very difficult to train"
    ],
    weights: [1.0, 0.7, 0.4, 0.1],
    required: true,
    description: "This indicates intelligence and trainability"
  },
  {
    questionId: "independence_1",
    question: "How independent is your dog?",
    category: "independence",
    options: [
      "Very independent - prefers to be alone",
      "Somewhat independent",
      "Likes company but can be alone",
      "Very dependent - always wants to be with humans"
    ],
    weights: [1.0, 0.7, 0.4, 0.1],
    required: true,
    description: "This helps understand their attachment and separation anxiety levels"
  },
  {
    questionId: "playfulness_1",
    question: "How playful is your dog?",
    category: "playfulness",
    options: [
      "Extremely playful - always ready to play",
      "Very playful",
      "Moderately playful",
      "Not very playful - prefers to relax"
    ],
    weights: [1.0, 0.7, 0.4, 0.1],
    required: true,
    description: "This indicates their play drive and entertainment needs"
  }
];

// Cat survey questions
export const CAT_SURVEY: SurveyQuestion[] = [
  {
    questionId: "independence_1",
    question: "How independent is your cat?",
    category: "independence",
    options: [
      "Very independent - rarely seeks attention",
      "Somewhat independent",
      "Likes attention but on their terms",
      "Very social - always wants attention"
    ],
    weights: [1.0, 0.7, 0.4, 0.1],
    required: true,
    description: "This helps understand their social needs and attachment style"
  },
  {
    questionId: "activity_1",
    question: "How active is your cat?",
    category: "energy",
    options: [
      "Very active - always exploring and playing",
      "Moderately active",
      "Somewhat lazy",
      "Very lazy - sleeps most of the day"
    ],
    weights: [1.0, 0.7, 0.4, 0.1],
    required: true,
    description: "This helps determine their exercise and play needs"
  },
  {
    questionId: "curiosity_1",
    question: "How curious is your cat?",
    category: "intelligence",
    options: [
      "Extremely curious - investigates everything",
      "Very curious",
      "Moderately curious",
      "Not very curious - content with routine"
    ],
    weights: [1.0, 0.7, 0.4, 0.1],
    required: true,
    description: "This indicates their intelligence and enrichment needs"
  }
];

// Bird survey questions
export const BIRD_SURVEY: SurveyQuestion[] = [
  {
    questionId: "social_1",
    question: "How social is your bird?",
    category: "social",
    options: [
      "Very social - always wants interaction",
      "Social with family members",
      "Moderately social",
      "Prefers to be left alone"
    ],
    weights: [1.0, 0.7, 0.4, 0.1],
    required: true,
    description: "This helps understand their social interaction needs"
  },
  {
    questionId: "vocalization_1",
    question: "How vocal is your bird?",
    category: "communication",
    options: [
      "Very vocal - constantly making sounds",
      "Moderately vocal",
      "Somewhat quiet",
      "Very quiet - rarely makes sounds"
    ],
    weights: [1.0, 0.7, 0.4, 0.1],
    required: true,
    description: "This indicates their communication style and personality"
  },
  {
    questionId: "intelligence_1",
    question: "How quickly does your bird learn new things?",
    category: "intelligence",
    options: [
      "Learns very quickly",
      "Learns at a normal pace",
      "Takes time to learn",
      "Difficulty learning new things"
    ],
    weights: [1.0, 0.7, 0.4, 0.1],
    required: true,
    description: "This indicates their intelligence and training potential"
  }
];

// Survey registry
export const SURVEYS = {
  dog: DOG_SURVEY,
  cat: CAT_SURVEY,
  bird: BIRD_SURVEY
} as const; 