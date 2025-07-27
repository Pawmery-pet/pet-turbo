"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { personalityService } from '@/personality';

interface PendingPet {
  jobId: string;
  petName: string;
  petType: string;
  breed: string;
  status: string;
  createdAt: string;
  estimatedWaitTime?: string;
}

export default function PendingPetJobs() {
  const [pendingPets, setPendingPets] = useState<PendingPet[]>([]);
  const [loadingStatus, setLoadingStatus] = useState<Record<string, boolean>>({});

  // Load pending pets from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('pawmery-pending-pets');
    if (stored) {
      try {
        const pets = JSON.parse(stored);
        setPendingPets(pets);
      } catch (error) {
        console.error('Error loading pending pets:', error);
      }
    }
  }, []);

  // Function to check individual job status
  const checkJobStatus = async (jobId: string) => {
    setLoadingStatus(prev => ({ ...prev, [jobId]: true }));
    
    try {
      const status = await personalityService.getJobStatus(jobId);
      
      // Update the status in localStorage and state
      const updatedPets = pendingPets.map(pet => 
        pet.jobId === jobId ? { ...pet, status: status.status } : pet
      );
      
      setPendingPets(updatedPets);
      localStorage.setItem('pawmery-pending-pets', JSON.stringify(updatedPets));
      
      // If job completed, could show a notification
      if (status.status === 'success') {
        alert(`${pendingPets.find(p => p.jobId === jobId)?.petName}'s story is ready! 🎉`);
      }
      
    } catch (error) {
      console.error('Error checking job status:', error);
      alert('Error checking job status. Please try again.');
    } finally {
      setLoadingStatus(prev => ({ ...prev, [jobId]: false }));
    }
  };

  // Don't render if no pending pets
  if (pendingPets.length === 0) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pet Creation Status</h3>
      <div className="space-y-4">
        {pendingPets.map((pet) => (
          <div key={pet.jobId} className="bg-white border-l-4 border-blue-500 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">{getPetEmoji(pet.petType)}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{pet.petName}</h4>
                  <p className="text-sm text-gray-600">
                    {pet.breed} • Created {new Date(pet.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pet.status)}`}>
                    {pet.status}
                  </span>
                  {pet.estimatedWaitTime && (
                    <p className="text-xs text-gray-500 mt-1">Est: {pet.estimatedWaitTime}</p>
                  )}
                </div>
                <button
                  onClick={() => checkJobStatus(pet.jobId)}
                  disabled={loadingStatus[pet.jobId]}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
                >
                  {loadingStatus[pet.jobId] ? 'Checking...' : 'Check Status'}
                </button>
                <Link
                  href={`/pets/${pet.jobId}`}
                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 