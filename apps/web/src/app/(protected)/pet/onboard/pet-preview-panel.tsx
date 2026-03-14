"use client";

import { useRouter } from "next/navigation";
import type { PetOnboardingState } from "./derive-pet-state";

const PET_EMOJI: Record<string, string> = {
  dog: "🐶",
  cat: "🐱",
  bird: "🦜",
  rabbit: "🐰",
  sheep: "🐑",
};

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-12 text-gray-400">{label}</span>
      {value ? (
        <span className="font-medium capitalize text-gray-900">{value}</span>
      ) : (
        <span className="text-gray-300">···</span>
      )}
    </div>
  );
}

export function PetPreviewPanel({ state }: { state: PetOnboardingState }) {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col gap-4 p-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-900">Your Pet</h2>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-3xl">
            {state.type ? PET_EMOJI[state.type] : "🐾"}
          </div>
          <div className="flex flex-col gap-1">
            <InfoRow label="Name" value={state.name} />
            <InfoRow label="Type" value={state.type} />
            <InfoRow label="Breed" value={state.breed} />
          </div>
        </div>
      </div>

      {state.petId && (
        <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Personality</h2>
          {state.narrative ? (
            <p className="text-sm leading-relaxed text-gray-600">
              {state.narrative}
            </p>
          ) : (
            <p className="text-sm text-gray-400">Interview in progress…</p>
          )}
        </div>
      )}

      {!state.petId && (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
          Pet details will appear here as we chat.
        </div>
      )}

      {state.narrative && (
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mt-auto w-full rounded-xl bg-orange-400 py-3 font-semibold text-white transition-colors hover:bg-orange-500"
        >
          Done
        </button>
      )}
    </div>
  );
}
