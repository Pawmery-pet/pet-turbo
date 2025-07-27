export interface SurveyQuestion {
  questionId: string;
  question: string;
  category: string;
  options: string[];
  weights: number[];
  required: boolean;
  description: string;
}

export interface SurveyResponse {
  questionId: string;
  selectedIndex: number;
  answer: string;
}

export interface PersonalityTrait {
  traitId: string;
  name: string;
  value: number;
  category: string;
  confidence: number;
  description: string;
}

export interface FetchSurveyParams {
  kind: 'dog' | 'cat' | 'bird';
  breed: string;
}

// Job processing types
export type JobStatus = 'queued' | 'processing' | 'success' | 'failed';

export interface JobCreationResponse {
  estimatedWaitTime: string;
  jobId: string;
  message: string;
  status: JobStatus;
  statusUrl: string;
}

export interface JobStatusResponse {
  jobId: string;
  status: JobStatus;
  message: string;
  // Fields present in processing/failed states
  petId?: string;
  progress?: number;
  createdAt?: string;
  updatedAt?: string;
  // Field present only in failed state
  error?: string;
  // Fields present only in success state - the response IS the result
  personalityId?: string;
  traits?: PersonalityTrait[];
  confidence?: number;
  sessionId?: string;
  summary?: string;
  completedAt?: string;
  processingTime?: number;
}

// New types for the complete request body structure
export interface OwnerInfo {
  ownerId: string;
  ownerName: string;
  email: string;
  phone: string;
}

export interface PetMetadata {
  breed: string;
  age?: number;
  weight?: number;
  gender?: 'male' | 'female';
  neutered?: boolean;
  source: string;
  quizVersion: string;
  timestamp: string;
  location?: string;
  environment?: string;
  previousQuizzes?: number;
}

export interface QuizAnswer {
  questionId: string;
  answer: string;
  weight: number;
  category: string;
}

export interface Quiz {
  quizId: string;
  title: string;
  petType: string;
  questions: SurveyQuestion[];
  answers: QuizAnswer[];
}

export interface PersonalityAnalysisRequestBody {
  petId: string;
  petName: string;
  petType: string;
  quiz: Quiz;
  answers: QuizAnswer[];
  ownerInfo: OwnerInfo;
  metadata: PetMetadata;
}

export interface AnalyzePersonalityParams {
  petName: string;
  kind: 'dog' | 'cat' | 'bird';
  breed: string;
  responses: SurveyResponse[];
  ownerInfo: OwnerInfo;
  metadata?: Partial<PetMetadata>;
} 