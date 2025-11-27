// Avatar Service
// Generates emoji-style avatars with color filtering

// Available colors for avatar backgrounds
export const AVATAR_COLORS = [
    { name: 'Yellow', value: 'ffd700', emoji: '🟡' },
    { name: 'Blue', value: '4169e1', emoji: '🔵' },
    { name: 'Red', value: 'ff6b6b', emoji: '🔴' },
    { name: 'Green', value: '51cf66', emoji: '🟢' },
    { name: 'Purple', value: '9775fa', emoji: '🟣' },
    { name: 'Orange', value: 'ff922b', emoji: '🟠' },
    { name: 'Pink', value: 'ff6b9d', emoji: '🩷' },
    { name: 'Cyan', value: '22b8cf', emoji: '🩵' }
];

// Unique face variations to ensure different expressions
const FACE_SEEDS = [
    'happy', 'smiling', 'winking', 'laughing', 'cool', 'silly',
    'excited', 'cheerful', 'playful', 'joyful', 'grinning', 'beaming',
    'delighted', 'pleased', 'content', 'glad', 'merry', 'jolly',
    'thrilled', 'ecstatic', 'blissful', 'radiant', 'bright', 'sunny'
];

// Generate a random avatar URL based on seed
export const generateAvatarUrl = (seed, backgroundColor = null) => {
    const encodedSeed = encodeURIComponent(seed);
    const bgColor = backgroundColor ? `&backgroundColor=${backgroundColor}` : '';

    return `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodedSeed}${bgColor}`;
};

// Get all available colors
export const getAvatarColors = () => AVATAR_COLORS;

// Generate avatars for all colors (variety pack)
const generateAllColorsVariety = (baseSeed) => {
    const allAvatars = [];
    let avatarId = 0;

    // Generate 2 avatars per color, in color order
    AVATAR_COLORS.forEach((color) => {
        for (let i = 0; i < 2; i++) {
            const faceSeed = FACE_SEEDS[avatarId % FACE_SEEDS.length];
            const uniqueSeed = `${baseSeed}-${color.name}-${faceSeed}-${avatarId}`;

            allAvatars.push({
                id: avatarId,
                url: generateAvatarUrl(uniqueSeed, color.value),
                seed: uniqueSeed,
                backgroundColor: color.value,
                colorName: color.name
            });
            avatarId++;
        }
    });

    return allAvatars.slice(0, 16); // Return 16 avatars (2 per color × 8 colors)
};

// Generate avatars for a specific color
const generateSingleColorAvatars = (baseSeed, backgroundColor, count = 12) => {
    const avatars = [];

    for (let i = 0; i < count; i++) {
        const faceSeed = FACE_SEEDS[i % FACE_SEEDS.length];
        const uniqueSeed = `${baseSeed}-${backgroundColor}-${faceSeed}-${i}-${Date.now()}`;

        avatars.push({
            id: i,
            url: generateAvatarUrl(uniqueSeed, backgroundColor),
            seed: uniqueSeed,
            backgroundColor
        });
    }

    return avatars;
};

// Generate avatars for all colors or filtered by color
export const generateColorFilteredAvatars = (seed, selectedColor = null) => {
    if (selectedColor) {
        // Generate 12 unique avatars for the selected color
        return generateSingleColorAvatars(seed, selectedColor, 12);
    } else {
        // Generate variety pack: 2 avatars per color, ordered by color
        return generateAllColorsVariety(seed);
    }
};

// Generate avatar options (legacy function for compatibility)
export const generateAvatarOptions = (seed, color = null, count = 12) => {
    return generateColorFilteredAvatars(seed, color);
};
