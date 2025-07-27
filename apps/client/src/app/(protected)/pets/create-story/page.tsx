"use client";

import type { SurveyQuestion, SurveyResponse, OwnerInfo, JobCreationResponse } from "@/personality";
import { personalityService } from "@/personality";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface FormData {
  name: string;
  type: 'dog' | 'cat' | 'bird' | '';
  breed: string;
  responses: SurveyResponse[];
  ownerInfo: OwnerInfo;
}

export default function CreateStoryPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: '',
    breed: '',
    responses: [],
    ownerInfo: {
      ownerId: '',
      ownerName: '',
      email: '',
      phone: ''
    }
  });
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([]);
  const [jobCreation, setJobCreation] = useState<JobCreationResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSurvey, setIsLoadingSurvey] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pawmery-create-story');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed.formData }));
        setCurrentStep(parsed.currentStep || 1);
        setSurveyQuestions(parsed.surveyQuestions || []);
      } catch (e) {
        console.log('Failed to load saved data');
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('pawmery-create-story', JSON.stringify({
      formData,
      currentStep,
      surveyQuestions
    }));
  }, [formData, currentStep, surveyQuestions]);

  // Load survey when pet type and breed are selected
  useEffect(() => {
    if (formData.type && formData.breed && currentStep === 3 && surveyQuestions.length === 0) {
      loadSurvey();
    }
  }, [formData.type, formData.breed, currentStep]);

  const loadSurvey = async () => {
    if (!formData.type || !formData.breed) return;
    
    setIsLoadingSurvey(true);
    try {
      const questions = await personalityService.fetchSurvey({
        kind: formData.type as 'dog' | 'cat' | 'bird',
        breed: formData.breed
      });
      setSurveyQuestions(questions);
      // Clear any existing responses when loading new survey
      setFormData(prev => ({ ...prev, responses: [] }));
    } catch (error) {
      console.error('Failed to load survey:', error);
    } finally {
      setIsLoadingSurvey(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 5) { // Changed from 4 to 5 steps
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const submitJobToServer = async () => {
    if (!formData.type || !formData.breed || !formData.ownerInfo.ownerName || !formData.ownerInfo.email) return;
    
    setIsSubmitting(true);
    try {
      // Generate unique owner ID if not set
      const ownerInfo = {
        ...formData.ownerInfo,
        ownerId: formData.ownerInfo.ownerId || "owner_" + Date.now()
      };

      const jobResponse = await personalityService.analyzePersonality({
        petName: formData.name,
        kind: formData.type as 'dog' | 'cat' | 'bird',
        breed: formData.breed,
        responses: formData.responses,
        ownerInfo,
        metadata: {
          age: 0, // Could collect this in future
          location: "Unknown" // Could collect this in future
        }
      });
      
      // Store job info in localStorage for tracking
      const pendingPets = JSON.parse(localStorage.getItem('pawmery-pending-pets') || '[]');
      pendingPets.push({
        jobId: jobResponse.jobId,
        petName: formData.name,
        petType: formData.type,
        breed: formData.breed,
        status: jobResponse.status,
        createdAt: new Date().toISOString(),
        estimatedWaitTime: jobResponse.estimatedWaitTime
      });
      localStorage.setItem('pawmery-pending-pets', JSON.stringify(pendingPets));
      
      setJobCreation(jobResponse);
      nextStep(); // Go to success step
    } catch (error) {
      console.error('Failed to submit pet creation job:', error);
      alert('Failed to create pet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const finishFlow = () => {
    // Clear creation localStorage but keep pending pets
    localStorage.removeItem('pawmery-create-story');
    // Redirect to dashboard to see job status
    router.push('/dashboard');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: 
        return formData.name.trim() && 
               formData.type && 
               formData.ownerInfo.ownerName.trim() && 
               formData.ownerInfo.email.trim();
      case 2: return formData.breed;
      case 3: return formData.responses.length === surveyQuestions.length;
      case 4: return true; // Confirmation step, no additional validation needed
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-semibold text-gray-900">
              {currentStep === 5 ? 'Pet Creation Started!' : 'Start Your Pet\'s Story'}
            </h1>
            <span className="text-sm text-gray-500">
              {currentStep === 5 ? 'Complete' : `Step ${currentStep} of 4`}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${currentStep === 5 ? 100 : (currentStep / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {currentStep === 1 && (
          <PetInfoStep 
            formData={formData} 
            updateFormData={updateFormData}
          />
        )}
        
        {currentStep === 2 && (
          <BreedSelectionStep 
            formData={formData} 
            updateFormData={updateFormData}
          />
        )}
        
        {currentStep === 3 && (
          <SurveyStep 
            formData={formData} 
            updateFormData={updateFormData}
            surveyQuestions={surveyQuestions}
            isLoading={isLoadingSurvey}
          />
        )}
        
        {currentStep === 4 && (
          <ConfirmationStep 
            formData={formData} 
            updateFormData={updateFormData}
            surveyQuestions={surveyQuestions}
          />
        )}

        {currentStep === 5 && jobCreation && (
          <JobCreationSuccessStep 
            jobCreation={jobCreation}
            onFinish={finishFlow}
          />
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentStep < 4 && (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          )}
          
          {currentStep === 4 && (
            <button
              onClick={submitJobToServer}
              disabled={!canProceed() || isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Pet...' : 'Confirm & Create Pet'}
            </button>
          )}
          
          {currentStep === 5 && (
            <button
              onClick={finishFlow}
              className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step 1: Pet Info
function PetInfoStep({ formData, updateFormData }: { 
  formData: FormData; 
  updateFormData: (updates: Partial<FormData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your pet</h2>
        <p className="text-gray-600">Let's start with the basics</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Pet Name */}
        <div>
          <label htmlFor="petName" className="block text-sm font-medium text-gray-700 mb-2">
            What's your pet's name?
          </label>
          <input
            type="text"
            id="petName"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your pet's name"
          />
        </div>

        {/* Pet Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            What type of pet do you have?
          </label>
          <div className="grid grid-cols-3 gap-4">
            {(['dog', 'cat', 'bird'] as const).map((type) => (
              <button
                key={type}
                onClick={() => updateFormData({ type, breed: '' })}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  formData.type === type
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">
                  {type === 'dog' ? '🐕' : type === 'cat' ? '🐱' : '🐦'}
                </div>
                <div className="font-medium capitalize">{type}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Owner Info Collection at Step 1 */}
        {formData.type && (
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Owner Information</h3>
            
            <div>
              <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-2">
                Your name
              </label>
              <input
                type="text"
                id="ownerName"
                value={formData.ownerInfo.ownerName}
                onChange={(e) => updateFormData({ ownerInfo: { ...formData.ownerInfo, ownerName: e.target.value } })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Your email
              </label>
              <input
                type="email"
                id="email"
                value={formData.ownerInfo.email}
                onChange={(e) => updateFormData({ ownerInfo: { ...formData.ownerInfo, email: e.target.value } })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Your phone (optional)
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.ownerInfo.phone}
                onChange={(e) => updateFormData({ ownerInfo: { ...formData.ownerInfo, phone: e.target.value } })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your phone number"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Step 2: Breed Selection
function BreedSelectionStep({ formData, updateFormData }: { 
  formData: FormData; 
  updateFormData: (updates: Partial<FormData>) => void;
}) {
  const breeds = formData.type ? personalityService.getBreeds(formData.type as 'dog' | 'cat' | 'bird') : [];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What breed is {formData.name}?</h2>
        <p className="text-gray-600">Choose the breed that best matches your {formData.type}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {breeds.map((breed) => (
            <button
              key={breed}
              onClick={() => updateFormData({ breed })}
              className={`p-3 border-2 rounded-lg text-sm transition-colors ${
                formData.breed === breed
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {breed}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 3: Survey
function SurveyStep({ 
  formData, 
  updateFormData, 
  surveyQuestions, 
  isLoading 
}: { 
  formData: FormData; 
  updateFormData: (updates: Partial<FormData>) => void;
  surveyQuestions: SurveyQuestion[];
  isLoading: boolean;
}) {
  const handleAnswerSelect = (questionId: string, selectedIndex: number, answer: string) => {
    const updatedResponses = formData.responses.filter(r => r.questionId !== questionId);
    updatedResponses.push({ questionId, selectedIndex, answer });
    updateFormData({ responses: updatedResponses });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Questions...</h2>
          <p className="text-gray-600">Preparing personalized questions for {formData.name}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Getting questions ready for your {formData.breed}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about {formData.name}'s personality</h2>
        <p className="text-gray-600">These questions help us understand their unique character</p>
      </div>

      <div className="space-y-6">
        {surveyQuestions.map((question, index) => {
          const response = formData.responses.find(r => r.questionId === question.questionId);
          
          return (
            <div key={question.questionId} className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {index + 1}. {question.question}
                </h3>
                <p className="text-sm text-gray-600">{question.description}</p>
              </div>
              
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <button
                    key={optionIndex}
                    onClick={() => handleAnswerSelect(question.questionId, optionIndex, option)}
                    className={`w-full text-left p-3 border rounded-lg transition-colors ${
                      response?.selectedIndex === optionIndex
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Step 4: Confirmation
function ConfirmationStep({ formData, updateFormData, surveyQuestions }: { 
  formData: FormData; 
  updateFormData: (updates: Partial<FormData>) => void;
  surveyQuestions: SurveyQuestion[];
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Information</h2>
        <p className="text-gray-600">Please review the information you've provided for {formData.name}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Pet Info */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Pet Details</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="mb-2"><strong>Name:</strong> {formData.name}</p>
            <p className="mb-2"><strong>Type:</strong> {formData.type}</p>
            <p><strong>Breed:</strong> {formData.breed}</p>
          </div>
        </div>

        {/* Survey Responses */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Personality Survey</h3>
          {formData.responses.length > 0 ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              {formData.responses.map((response, index) => {
                const question = surveyQuestions.find(q => q.questionId === response.questionId);
                return (
                  <div key={response.questionId} className="mb-3 last:mb-0">
                    <p className="text-sm font-medium text-gray-700">{question?.question}</p>
                    <p className="text-sm text-blue-600">→ {response.answer}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No personality responses provided.</p>
          )}
        </div>

        {/* Owner Info */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Owner Information</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="mb-2"><strong>Name:</strong> {formData.ownerInfo.ownerName}</p>
            <p className="mb-2"><strong>Email:</strong> {formData.ownerInfo.email}</p>
            {formData.ownerInfo.phone && <p><strong>Phone:</strong> {formData.ownerInfo.phone}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 5: Job Creation Success
function JobCreationSuccessStep({ 
  jobCreation, 
  onFinish 
}: { 
  jobCreation: JobCreationResponse;
  onFinish: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Pet's Story is Being Created!</h2>
        <p className="text-gray-600">We've started generating your pet's unique story.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
          <div className="text-2xl">✨</div>
          <div>
            <h3 className="font-semibold text-green-800">Job Created</h3>
            <p className="text-sm text-green-600">Job ID: {jobCreation.jobId}</p>
            <p className="text-sm text-green-600">Status: {jobCreation.status}</p>
            <p className="text-sm text-green-600">Estimated Wait Time: {jobCreation.estimatedWaitTime} seconds</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What's next?</h3>
          <p className="text-gray-600">
            Your pet's story is being generated. You can check its status in your dashboard.
            Once it's ready, you'll receive an email notification.
          </p>
          <button
            onClick={onFinish}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  );
} 