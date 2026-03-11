"use client";

import type { UIMessage } from "ai";
import { useRouter } from "next/navigation";
import { derivePetState } from "./derive-pet-state";

const PET_EMOJI: Record<string, string> = {
  dog: "🐶",
  cat: "🐱",
  bird: "🦜",
  rabbit: "🐰",
  sheep: "🐑",
};

const TRAIT_LABELS: Record<string, string[]> = {
  dog: ["energy", "playfulness", "loyalty", "trainability", "affection"],
  cat: ["independence", "curiosity", "playfulness", "affection", "mischief"],
  bird: ["vocality", "curiosity", "affection", "mimicry", "restlessness"],
  rabbit: ["skittishness", "affection", "curiosity", "energy", "playfulness"],
  sheep: [
    "curiosity",
    "friendliness",
    "energy",
    "independence",
    "stubbornness",
  ],
};

function TraitBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-right text-sm capitalize text-gray-500">
        {label}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-orange-400 transition-all duration-500"
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
      <span className="w-6 text-sm text-gray-400">{score}</span>
    </div>
  );
}

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

export function PetPreviewPanel({ messages }: { messages: UIMessage[] }) {
  const router = useRouter();
  const state = derivePetState(messages);
  const traitKeys = state.type ? (TRAIT_LABELS[state.type] ?? []) : [];

  return (
    <div className="flex h-full flex-col gap-4">
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
          {traitKeys.length > 0 && (
            <div className="flex flex-col gap-2">
              {traitKeys.map((trait) => (
                <TraitBar
                  key={trait}
                  label={trait}
                  score={state.traits?.[trait] ?? 0}
                />
              ))}
            </div>
          )}
          {state.narrative && (
            <p className="text-sm leading-relaxed text-gray-600">
              {state.narrative}
            </p>
          )}
          {!state.traits && (
            <p className="text-sm text-gray-400">Interview in progress…</p>
          )}
        </div>
      )}

      {!state.petId && (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
          Pet details will appear here as we chat.
        </div>
      )}

      {state.traits && (
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
