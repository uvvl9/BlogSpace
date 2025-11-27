// Avatar Service
// Generates random emoji-style avatars using DiceBear API

// Simple emoji/face styles (like Reddit avatars)
const AVATAR_STYLES = [
    'fun-emoji',      // Simple emoji faces with different expressions
    'bottts-neutral', // Robot faces
    'personas'        // Simple human faces
];

// Generate a random avatar URL based on seed
export const generateAvatarUrl = (seed, style = 'fun-emoji') => {
    const encodedSeed = encodeURIComponent(seed);

    // DiceBear API v7 - fun-emoji style for simple faces
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodedSeed}`;
};

// Get all available avatar styles
export const getAvatarStyles = () => AVATAR_STYLES;

// Generate multiple avatar options for user to choose from
export const generateAvatarOptions = (seed, count = 6) => {
    const options = [];

    // Generate 6 different fun-emoji avatars with different variations
    for (let i = 0; i < count; i++) {
        const seedWithIndex = `${seed}-emoji-${i}`;
        options.push({
            id: i,
            url: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(seedWithIndex)}`,
            style: 'fun-emoji',
            seed: seedWithIndex
        });
    }

    return options;
};
