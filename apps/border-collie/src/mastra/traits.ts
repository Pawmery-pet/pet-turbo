export const TRAIT_VOCABULARY: Record<string, string[]> = {
	dog:    ["energy", "playfulness", "loyalty", "trainability", "affection"],
	cat:    ["independence", "curiosity", "playfulness", "affection", "mischief"],
	bird:   ["vocality", "curiosity", "affection", "mimicry", "restlessness"],
	rabbit: ["skittishness", "affection", "curiosity", "energy", "playfulness"],
	sheep:  ["curiosity", "friendliness", "energy", "independence", "stubbornness"],
};

export function getTraitVocabulary(type: string): string[] {
	return TRAIT_VOCABULARY[type] ?? TRAIT_VOCABULARY["dog"];
}
