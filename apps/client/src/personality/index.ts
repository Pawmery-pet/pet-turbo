// Main service
export { personalityService as default, default as personalityService } from './service';

// Types
export type {
  AnalyzePersonalityParams, 
  FetchSurveyParams, 
  PersonalityTrait, 
  SurveyQuestion,
  SurveyResponse,
  OwnerInfo,
  JobCreationResponse,
  JobStatusResponse,
  JobStatus,
  PetMetadata,
  PersonalityAnalysisRequestBody
} from './types';

// Data
export { BIRD_SURVEY, CAT_SURVEY, DOG_SURVEY, SURVEYS } from './data/surveys';
