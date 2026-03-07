"use client";

import type {
	SurveyQuestion,
	SurveyResponse,
	OwnerInfo,
	JobCreationResponse,
} from "@/personality";
import { personalityService } from "@/personality";
import { petService, type PetResponse } from "@/services/petService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface FormData {
	name: string;
	type: "dog" | "cat" | "bird" | "";
	breed: string;
	responses: SurveyResponse[];
	ownerInfo: OwnerInfo;
}

interface CreateStoryClientProps {
	session: {
		user: {
			id: string;
			name?: string | null;
			email?: string | null;
			image?: string | null;
		};
	};
}

export function CreateStoryClient({ session }: CreateStoryClientProps) {
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState(1);
	const [formData, setFormData] = useState<FormData>({
		name: "",
		type: "",
		breed: "",
		responses: [],
		ownerInfo: {
			ownerId: "",
			ownerName: "",
			email: "",
			phone: "",
		},
	});
	const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([]);
	const [jobCreation, setJobCreation] = useState<JobCreationResponse | null>(
		null,
	);
	const [createdPet, setCreatedPet] = useState<PetResponse | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoadingSurvey, setIsLoadingSurvey] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	// Auto-populate owner info from session on mount
	useEffect(() => {
		setFormData((prev) => ({
			...prev,
			ownerInfo: {
				ownerId: session.user.id,
				ownerName: session.user.name || "",
				email: session.user.email || "",
				phone: prev.ownerInfo.phone, // Keep any existing phone number
			},
		}));
	}, [session]);

	// Load from localStorage on mount
	useEffect(() => {
		const saved = localStorage.getItem("pawmery-create-story");
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				// Merge saved data but prioritize session info for owner details
				setFormData((prev) => ({
					...prev,
					...parsed.formData,
					ownerInfo: {
						ownerId: session.user.id, // Always use current session
						ownerName:
							session.user.name || parsed.formData.ownerInfo?.ownerName || "",
						email: session.user.email || parsed.formData.ownerInfo?.email || "",
						phone:
							parsed.formData.ownerInfo?.phone || prev.ownerInfo.phone || "",
					},
				}));
				setCurrentStep(parsed.currentStep || 1);
				setSurveyQuestions(parsed.surveyQuestions || []);
			} catch (e) {
				console.log("Failed to load saved data");
			}
		}
	}, [session]);

	// Save to localStorage whenever data changes
	useEffect(() => {
		localStorage.setItem(
			"pawmery-create-story",
			JSON.stringify({
				formData,
				currentStep,
				surveyQuestions,
			}),
		);
	}, [formData, currentStep, surveyQuestions]);

	// Load survey when pet type and breed are selected
	useEffect(() => {
		if (
			formData.type &&
			formData.breed &&
			currentStep === 3 &&
			surveyQuestions.length === 0
		) {
			loadSurvey();
		}
	}, [formData.type, formData.breed, currentStep]);

	const updateFormData = (updates: Partial<FormData>) => {
		setFormData((prev) => ({ ...prev, ...updates }));
	};

	const loadSurvey = async () => {
		if (!formData.type || !formData.breed) return;

		setIsLoadingSurvey(true);
		try {
			const questions = await personalityService.fetchSurvey({
				kind: formData.type as "dog" | "cat" | "bird",
				breed: formData.breed,
			});
			setSurveyQuestions(questions);
		} catch (error) {
			console.error("Failed to load survey:", error);
		} finally {
			setIsLoadingSurvey(false);
		}
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);
		setSubmitError(null);

		try {
			// Step 1: Create the pet in the backend first
			console.log("Creating pet in backend...");
			const pet = await petService.createPet(session.user.id, {
				name: formData.name,
				species: formData.type,
				breed: formData.breed,
			});

			setCreatedPet(pet);
			console.log("Pet created successfully:", pet);

			// Step 2: Optional - Start personality analysis job
			// This is now separate from pet creation and can run in background
			try {
				const personalityResult = await personalityService.analyzePersonality({
					petName: formData.name,
					kind: formData.type as "dog" | "cat" | "bird",
					breed: formData.breed,
					responses: formData.responses,
					ownerInfo: formData.ownerInfo,
					metadata: {
						age: 0,
						location: "Unknown",
					},
				});

				setJobCreation(personalityResult);
				console.log("Personality analysis started:", personalityResult);

				// Optional: Update pet with personality info once analysis is complete
				// This could be done via polling or webhooks in the future
			} catch (personalityError) {
				console.warn(
					"Personality analysis failed, but pet was created:",
					personalityError,
				);
				// Pet creation succeeded, so we don't treat this as a fatal error
			}
		} catch (error) {
			console.error("Failed to create pet:", error);
			setSubmitError(
				error instanceof Error ? error.message : "Failed to create pet",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const nextStep = () => {
		if (currentStep < 4) {
			setCurrentStep(currentStep + 1);
		}
	};

	const prevStep = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const canProceedFromStep1 = formData.name && formData.type;
	const canProceedFromStep2 = formData.breed;
	const canProceedFromStep3 =
		formData.responses.length === surveyQuestions.length;

	const handleViewPet = () => {
		// Clear the localStorage data since we're done
		localStorage.removeItem("pawmery-create-story");
		// Navigate to the specific pet page if we have a pet ID, otherwise go to pets list
		if (createdPet?.id) {
			router.push(`/pets/${createdPet.id}`);
		} else {
			router.push("/pets");
		}
	};

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			{/* Progress Bar */}
			<div className="mb-8">
				<div className="flex items-center">
					{[1, 2, 3, 4].map((step) => (
						<div key={step} className="flex items-center">
							<div
								className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
									step <= currentStep
										? "bg-blue-600 text-white"
										: "bg-gray-300 text-gray-600"
								}`}
							>
								{step}
							</div>
							{step < 4 && (
								<div
									className={`w-20 h-1 mx-2 ${
										step < currentStep ? "bg-blue-600" : "bg-gray-300"
									}`}
								/>
							)}
						</div>
					))}
				</div>
				<div className="flex justify-between mt-2 text-sm text-gray-600">
					<span>Pet Info</span>
					<span>Breed</span>
					<span>Survey</span>
					<span>Complete</span>
				</div>
			</div>

			{/* Step Content */}
			{currentStep === 1 && (
				<PetInfoStep
					formData={formData}
					updateFormData={updateFormData}
					session={session}
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
				<CompleteStep
					formData={formData}
					jobCreation={jobCreation}
					createdPet={createdPet}
					isSubmitting={isSubmitting}
					submitError={submitError}
					onSubmit={handleSubmit}
					onViewPet={handleViewPet}
				/>
			)}

			{/* Navigation */}
			<div className="flex justify-between mt-8">
				<button
					type="button"
					onClick={prevStep}
					disabled={currentStep === 1}
					className="px-4 py-2 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:text-gray-800"
				>
					← Previous
				</button>
				<button
					type="button"
					onClick={nextStep}
					disabled={
						currentStep === 4 ||
						(currentStep === 1 && !canProceedFromStep1) ||
						(currentStep === 2 && !canProceedFromStep2) ||
						(currentStep === 3 && !canProceedFromStep3)
					}
					className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{currentStep === 4 ? "Complete" : "Next →"}
				</button>
			</div>
		</div>
	);
}

// Step 1: Pet Info
function PetInfoStep({
	formData,
	updateFormData,
	session,
}: {
	formData: FormData;
	updateFormData: (updates: Partial<FormData>) => void;
	session: {
		user: {
			id: string;
			name?: string | null;
			email?: string | null;
		};
	};
}) {
	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold text-gray-900 mb-2">
					Tell us about your pet
				</h2>
				<p className="text-gray-600">Let's start with the basics</p>
			</div>

			<div className="bg-white rounded-lg shadow p-6 space-y-6">
				{/* Pet Name */}
				<div>
					<label
						htmlFor="petName"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
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
					<span className="block text-sm font-medium text-gray-700 mb-4">
						What type of pet do you have?
					</span>
					<div className="grid grid-cols-3 gap-4">
						{(["dog", "cat", "bird"] as const).map((type) => (
							<button
								key={type}
								type="button"
								onClick={() => updateFormData({ type, breed: "" })}
								className={`p-4 border-2 rounded-lg text-center transition-colors ${
									formData.type === type
										? "border-blue-500 bg-blue-50 text-blue-700"
										: "border-gray-200 hover:border-gray-300"
								}`}
							>
								<div className="text-3xl mb-2">
									{type === "dog" ? "🐕" : type === "cat" ? "🐱" : "🐦"}
								</div>
								<div className="font-medium capitalize">{type}</div>
							</button>
						))}
					</div>
				</div>

				{/* Owner Info - Now automatically populated and read-only */}
				{formData.type && (
					<div className="border-t pt-6 space-y-4">
						<h3 className="text-lg font-medium text-gray-700">
							Owner Information
							<span className="text-sm font-normal text-gray-500 ml-2">
								(Automatically filled from your account)
							</span>
						</h3>

						<div>
							<label
								htmlFor="ownerName"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Your name
							</label>
							<input
								type="text"
								id="ownerName"
								value={formData.ownerInfo.ownerName}
								readOnly
								className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed"
								placeholder="Name from your account"
							/>
						</div>

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Your email
							</label>
							<input
								type="email"
								id="email"
								value={formData.ownerInfo.email}
								readOnly
								className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed"
								placeholder="Email from your account"
							/>
						</div>

						<div>
							<label
								htmlFor="phone"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Your phone (optional)
							</label>
							<input
								type="tel"
								id="phone"
								value={formData.ownerInfo.phone}
								onChange={(e) =>
									updateFormData({
										ownerInfo: { ...formData.ownerInfo, phone: e.target.value },
									})
								}
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
function BreedSelectionStep({
	formData,
	updateFormData,
}: {
	formData: FormData;
	updateFormData: (updates: Partial<FormData>) => void;
}) {
	const breeds = formData.type
		? personalityService.getBreeds(formData.type as "dog" | "cat" | "bird")
		: [];

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold text-gray-900 mb-2">
					What breed is {formData.name}?
				</h2>
				<p className="text-gray-600">
					Choose the breed that best matches your {formData.type}
				</p>
			</div>

			<div className="bg-white rounded-lg shadow p-6">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
					{breeds.map((breed) => (
						<button
							key={breed}
							type="button"
							onClick={() => updateFormData({ breed })}
							className={`p-3 border-2 rounded-lg text-sm transition-colors ${
								formData.breed === breed
									? "border-blue-500 bg-blue-50 text-blue-700"
									: "border-gray-200 hover:border-gray-300"
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
	isLoading,
}: {
	formData: FormData;
	updateFormData: (updates: Partial<FormData>) => void;
	surveyQuestions: SurveyQuestion[];
	isLoading: boolean;
}) {
	const handleResponseChange = (
		questionId: string,
		selectedIndex: number,
		answer: string,
	) => {
		const updatedResponses = formData.responses.filter(
			(r) => r.questionId !== questionId,
		);
		updatedResponses.push({ questionId, selectedIndex, answer });
		updateFormData({ responses: updatedResponses });
	};

	const getResponseValue = (questionId: string): number | undefined => {
		return formData.responses.find((r) => r.questionId === questionId)
			?.selectedIndex;
	};

	if (isLoading) {
		return (
			<div className="text-center py-12">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
				<p className="mt-4 text-gray-600">Loading personality survey...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold text-gray-900 mb-2">
					Tell us about {formData.name}'s personality
				</h2>
				<p className="text-gray-600">
					Answer these questions to help us understand {formData.name} better
				</p>
			</div>

			<div className="bg-white rounded-lg shadow p-6 space-y-8">
				{surveyQuestions.map((question) => (
					<div key={question.questionId} className="space-y-4">
						<h3 className="text-lg font-medium text-gray-900">
							{question.question}
						</h3>
						<div className="space-y-2">
							{question.options.map((option, optionIndex) => (
								<label
									key={option}
									htmlFor={`${question.questionId}-${option}`}
									className="flex items-center space-x-3 cursor-pointer"
								>
									<input
										id={`${question.questionId}-${optionIndex}`}
										type="radio"
										name={question.questionId}
										value={optionIndex}
										checked={
											getResponseValue(question.questionId) === optionIndex
										}
										onChange={() =>
											handleResponseChange(
												question.questionId,
												optionIndex,
												option,
											)
										}
										className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
									/>
									<span className="text-gray-700">{option}</span>
								</label>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// Step 4: Complete
function CompleteStep({
	formData,
	jobCreation,
	createdPet,
	isSubmitting,
	submitError,
	onSubmit,
	onViewPet,
}: {
	formData: FormData;
	jobCreation: JobCreationResponse | null;
	createdPet: PetResponse | null;
	isSubmitting: boolean;
	submitError: string | null;
	onSubmit: () => void;
	onViewPet: () => void;
}) {
	// Show success state if pet was created
	if (createdPet) {
		return (
			<div className="text-center space-y-6">
				<div className="text-6xl">🎉</div>
				<h2 className="text-3xl font-bold text-gray-900">
					{formData.name} has been created!
				</h2>
				<div className="bg-white rounded-lg shadow p-6 space-y-4">
					<div className="bg-green-50 border border-green-200 rounded-lg p-4">
						<h3 className="font-medium text-green-900 mb-2">
							Pet Successfully Created
						</h3>
						<div className="text-sm text-green-800 text-left">
							<p>
								<strong>Name:</strong> {createdPet.name}
							</p>
							<p>
								<strong>Species:</strong> {createdPet.species}
							</p>
							<p>
								<strong>Breed:</strong> {createdPet.breed}
							</p>
							<p>
								<strong>Created:</strong>{" "}
								{new Date(createdPet.createdAt).toLocaleDateString()}
							</p>
						</div>
					</div>

					{jobCreation && (
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<h3 className="font-medium text-blue-900 mb-2">
								Personality Analysis
							</h3>
							<p className="text-sm text-blue-800">
								We're also working on creating a personality profile for{" "}
								{formData.name}. This will be available soon!
							</p>
							<p className="text-xs text-blue-600 mt-2">
								Job ID: {jobCreation.jobId}
							</p>
						</div>
					)}

					<div className="space-y-2">
						<button
							type="button"
							onClick={onViewPet}
							className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
						>
							View {formData.name}'s Profile
						</button>
						<p className="text-sm text-gray-500">
							You can always come back to see {formData.name}'s personality once
							it's ready!
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Show error state if there was an error
	if (submitError) {
		return (
			<div className="text-center space-y-6">
				<div className="text-6xl">😞</div>
				<h2 className="text-2xl font-bold text-gray-900">
					Oops! Something went wrong
				</h2>
				<div className="bg-white rounded-lg shadow p-6 space-y-4">
					<div className="bg-red-50 border border-red-200 rounded-lg p-4">
						<h3 className="font-medium text-red-900 mb-2">
							Error Creating Pet
						</h3>
						<p className="text-sm text-red-800">{submitError}</p>
					</div>
					<button
						type="button"
						onClick={onSubmit}
						disabled={isSubmitting}
						className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	// Show initial form state
	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold text-gray-900 mb-2">
					Ready to create {formData.name}!
				</h2>
				<p className="text-gray-600">
					Review the information below and create your pet profile
				</p>
			</div>

			<div className="bg-white rounded-lg shadow p-6 space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<h3 className="font-medium text-gray-900 mb-2">Pet Information</h3>
						<div className="space-y-1 text-sm text-gray-600">
							<p>
								<span className="font-medium">Name:</span> {formData.name}
							</p>
							<p>
								<span className="font-medium">Type:</span>{" "}
								{formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
							</p>
							<p>
								<span className="font-medium">Breed:</span> {formData.breed}
							</p>
						</div>
					</div>
					<div>
						<h3 className="font-medium text-gray-900 mb-2">
							Owner Information
						</h3>
						<div className="space-y-1 text-sm text-gray-600">
							<p>
								<span className="font-medium">Name:</span>{" "}
								{formData.ownerInfo.ownerName}
							</p>
							<p>
								<span className="font-medium">Email:</span>{" "}
								{formData.ownerInfo.email}
							</p>
							{formData.ownerInfo.phone && (
								<p>
									<span className="font-medium">Phone:</span>{" "}
									{formData.ownerInfo.phone}
								</p>
							)}
						</div>
					</div>
				</div>

				<div>
					<h3 className="font-medium text-gray-900 mb-2">Survey Responses</h3>
					<p className="text-sm text-gray-600">
						{formData.responses.length} questions answered to help create{" "}
						{formData.name}'s unique personality profile.
					</p>
				</div>

				<button
					type="button"
					onClick={onSubmit}
					disabled={isSubmitting}
					className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
				>
					{isSubmitting ? (
						<span className="flex items-center justify-center">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
							Creating {formData.name}...
						</span>
					) : (
						`Create ${formData.name}`
					)}
				</button>
			</div>
		</div>
	);
}
