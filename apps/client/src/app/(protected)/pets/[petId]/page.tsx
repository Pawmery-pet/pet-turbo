"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { personalityService, JobStatusResponse, JobStatus } from '@/personality';

interface PendingPet {
  jobId: string;
  petName: string;
  petType: string;
  breed: string;
  status: string;
  createdAt: string;
  estimatedWaitTime?: string;
}

export default function PetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const petId = params.petId as string;
  
  const [pendingPet, setPendingPet] = useState<PendingPet | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatusResponse | null>(null);
  const [personalityResult, setPersonalityResult] = useState<JobStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    console.log({ personalityResult})
    console.log('🚀 Component mounted, petId:', petId);
    
    // Check if this is a pending pet
    const stored = localStorage.getItem('pawmery-pending-pets');
    console.log('💾 Raw localStorage data:', stored);
    
    if (stored) {
      try {
        const pets: PendingPet[] = JSON.parse(stored);
        console.log('📋 Parsed pending pets:', pets);
        const pet = pets.find(p => p.jobId === petId);
        console.log('🎯 Found matching pet:', pet);
        
        if (pet) {
          setPendingPet(pet);
          console.log('▶️  Starting polling for pet with status:', pet.status);
          startPollingIfNeeded(pet);
        } else {
          console.log('❌ No matching pet found in localStorage');
          setError('Pet not found in pending jobs');
        }
      } catch (error) {
        console.error('Error loading pending pets:', error);
        setError('Error loading pet information');
      }
    } else {
      console.log('📭 No pending pets found in localStorage');
      setError('No pending jobs found');
    }
  }, [petId]);

  // Separate useEffect to track personalityResult changes
  useEffect(() => {
    console.log('🎭 PersonalityResult state changed:', personalityResult);
    if (personalityResult) {
      console.log('🎉 PersonalityResult is now set!', {
        summary: personalityResult.summary,
        traits: personalityResult.traits?.length || 0,
        jobId: personalityResult.jobId
      });
    }
  }, [personalityResult]);

  const startPollingIfNeeded = (pet: PendingPet) => {
    console.log('🤔 Deciding polling strategy for pet status:', pet.status);
    
    if (pet.status === 'success' || pet.status === 'failed') {
      // If already completed/failed, just get final status
      console.log('✅ Pet already completed/failed, checking final status...');
      checkFinalStatus();
    } else {
      // Start real-time polling
      console.log('🔄 Pet still in progress, starting real-time polling...');
      startPolling();
    }
  };

  const checkFinalStatus = async () => {
    try {
      console.log('🔍 Checking final status for jobId:', petId);
      const status = await personalityService.getJobStatus(petId);
      console.log('📄 Final status response:', status);
      setJobStatus(status);
      
      if (status.status === 'success') {
        console.log('✅ Job completed successfully, setting personality result:', status);
        setPersonalityResult(status);
        // Remove from pending pets since it's completed
        removePendingPet(petId);
      } else {
        console.log(`ℹ️  Status is ${status.status}, not success yet`);
      }
    } catch (error) {
      console.error('Error checking final status:', error);
      setError('Error loading pet results');
    }
  };

  const startPolling = async () => {
    if (isPolling) return; // Prevent multiple polling sessions
    
    console.log('🔄 Starting polling for jobId:', petId);
    setIsPolling(true);
    setError(null);
    
    try {
      const result = await personalityService.pollForCompletion(
        petId,
        (statusUpdate: JobStatusResponse) => {
          console.log('📡 Polling status update:', statusUpdate);
          setJobStatus(statusUpdate);
          
          // Update pending pet status in localStorage
          updatePendingPetStatus(petId, statusUpdate.status);
        }
      );
      
      console.log('🎉 Polling completed with result:', result);
      setPersonalityResult(result);
      setIsPolling(false);
      
      // Remove from pending pets since it's completed
      removePendingPet(petId);
      
    } catch (error) {
      console.error('❌ Polling error:', error);
      setError(error instanceof Error ? error.message : 'Error during polling');
      setIsPolling(false);
    }
  };

  const updatePendingPetStatus = (jobId: string, status: JobStatus) => {
    const stored = localStorage.getItem('pawmery-pending-pets');
    if (stored) {
      try {
        const pets: PendingPet[] = JSON.parse(stored);
        const updatedPets = pets.map(pet => 
          pet.jobId === jobId ? { ...pet, status } : pet
        );
        localStorage.setItem('pawmery-pending-pets', JSON.stringify(updatedPets));
        
        // Update local state too
        setPendingPet(prev => prev ? { ...prev, status } : null);
      } catch (error) {
        console.error('Error updating pending pet status:', error);
      }
    }
  };

  const removePendingPet = (jobId: string) => {
    const stored = localStorage.getItem('pawmery-pending-pets');
    if (stored) {
      try {
        const pets: PendingPet[] = JSON.parse(stored);
        const updatedPets = pets.filter(pet => pet.jobId !== jobId);
        localStorage.setItem('pawmery-pending-pets', JSON.stringify(updatedPets));
      } catch (error) {
        console.error('Error removing pending pet:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPetEmoji = (petType: string) => {
    switch (petType) {
      case 'dog': return '🐕';
      case 'cat': return '🐱';
      case 'bird': return '🐦';
      default: return '🐾';
    }
  };

  // Loading state
  if (!pendingPet && !error) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pet information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
            <Link
              href="/dashboard"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">{getPetEmoji(pendingPet?.petType || 'dog')}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{pendingPet?.petName}</h1>
              <p className="text-gray-600">{pendingPet?.breed}</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Status Section */}
      {jobStatus && (
        <div className={`border rounded-lg p-6 mb-6 ${getStatusColor(jobStatus.status)}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold">Status: {jobStatus.status}</h3>
                {isPolling && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>}
              </div>
              {jobStatus.message && <p className="text-sm mb-2">{jobStatus.message}</p>}
              {jobStatus.status === 'failed' && jobStatus.error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                  <strong>Error Details:</strong> {jobStatus.error}
                </div>
              )}
              {jobStatus.progress && (
                <div className="mt-2">
                  <p className="text-sm mb-1">Progress: {jobStatus.progress}%</p>
                  <div className="w-48 bg-white bg-opacity-50 rounded-full h-2">
                    <div
                      className="bg-current h-2 rounded-full transition-all duration-300"
                      style={{ width: `${jobStatus.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm">Job ID: {petId}</p>
              {jobStatus.createdAt && (
                <p className="text-xs">Created: {new Date(jobStatus.createdAt).toLocaleString()}</p>
              )}
              {jobStatus.updatedAt && (
                <p className="text-xs">Updated: {new Date(jobStatus.updatedAt).toLocaleString()}</p>
              )}
              {pendingPet && !jobStatus.createdAt && (
                <p className="text-xs">Created: {new Date(pendingPet.createdAt).toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {personalityResult ? (
        <div className="space-y-6">
          {/* Main Success Header */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎉</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {pendingPet?.petName}'s Story is Complete!
                </h2>
                <p className="text-green-700 font-medium">Analysis completed successfully</p>
              </div>
            </div>
            
            {/* Job Summary - Main Feature */}
            {personalityResult.summary && (
              <div className="bg-white border border-green-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-xl">📝</span>
                  <h3 className="text-xl font-bold text-gray-900">Personality Summary</h3>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-800 leading-relaxed text-lg">
                    {personalityResult.summary}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Analysis Metadata */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-600">Completed</p>
                <p className="text-gray-800">
                  {personalityResult.completedAt 
                    ? new Date(personalityResult.completedAt).toLocaleString()
                    : 'Just now'
                  }
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Processing Time</p>
                <p className="text-gray-800">
                  {personalityResult.processingTime 
                    ? `${Math.round(personalityResult.processingTime / 1000)}s`
                    : 'Quick'
                  }
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Job ID</p>
                <p className="text-gray-800 font-mono text-xs">{petId}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                <span>📝</span>
                <span>Add Memory</span>
              </button>
              <button className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                <span>📤</span>
                <span>Share Story</span>
              </button>
              <button className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
                <span>📊</span>
                <span>View Profile</span>
              </button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link
                href="/pets"
                className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center justify-center space-x-1"
              >
                <span>👀</span>
                <span>View All Pets</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Waiting for results */
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mb-6">
            <div className="animate-pulse">
              <div className="text-6xl mb-4">⏳</div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Creating {pendingPet?.petName}'s Profile...
            </h2>
            <p className="text-gray-600 mb-4">
              We're analyzing their personality and creating a unique profile for {pendingPet?.petName}.
            </p>
            
            {isPolling && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-blue-800 text-sm font-medium">
                    Checking status...
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-left max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 What we're doing:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Analyzing your pet's personality responses</li>
              <li>• Generating a summary of their personality</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 