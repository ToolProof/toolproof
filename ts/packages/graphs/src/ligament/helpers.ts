import { z } from "zod";


export const schemas = {
    SyllablesSchema: z.object({
        syllables: z.array(z.string()),
    }),
    StressSchema: (syllables: string[]) => {

        return syllables.length > 1
            ? z.object({
                stress: z.union([
                    z.literal(syllables[0]),
                    z.literal(syllables[1]),
                    ...syllables.slice(2).map((syllable) => z.literal(syllable)),
                ] as const), // Explicitly assert as `const` to make it readonly
            })
            : syllables.length === 1
                ? z.object({
                    stress: z.literal(syllables[0]),
                })
                : z.object({
                    stress: z.never(), // Handle empty array case
                });
    },
    SoundSchema: z.object({
        sound: z.union([
            z.literal("green"),
            z.literal("purple"),
            z.literal("blue"),
            z.literal("silver"),
            z.literal("mustard"),
            z.literal("wooden"),
            z.literal("gray"),
            z.literal("rose"),
            z.literal("red"),
            z.literal("olive"),
            z.literal("turquoise"),
            z.literal("black"),
            z.literal("white"),
            z.literal("brown")
        ])
    }),
};


export const prompts = {
    syllable: {
        system: "Your job is to split the provided word into syllables in accordance with American-English pronunciation.",
        user: (word: string) => `Split the word "${word}" into syllables.`,
    },
    stress: {
        system: "Your job is to determine which syllable in the provided word is stressed according to American-English pronunciation.",
        user: (word: string, syllablesString: string) => `Determine which syllable in the word "${word}" is stressed. Choose from the following syllables: ${syllablesString}.`, // ATTENTION: is this step necessary?
    },
    sound: {
        system: `Your job is to determine which vowel sound should be used in the pronunciation of the stressed syllable of a word, according to American-English pronunciation. The vowel sound will be  one of the sounds that are used in the pronunciation of a set of predefined colors. Below is a list of the possible colors together with a helper word that uses the same vowel sound as the respective color.
                        
                        green tea,
                        purple shirt,
                        blue moon,
                        silver pin,
                        mustard cup,
                        wooden hook,
                        gray day,
                        rose boat,
                        red pepper,
                        olive sock,
                        turquoise boat,
                        black cat,
                        white tie,
                        brown cow
                        
                        `,
        user: (word: string, stressedSyllable: string) => `Determine the vowel sound that should be used in the pronunciation of the stressed syllable of the word "${word}". The stressed syllable is "${stressedSyllable}".`,
    },
}

