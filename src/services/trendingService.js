// Trending Service
// Calculates trending posts and topics using Reddit/Twitter-style algorithms

// Reddit's "Hot" algorithm
// score = log10(abs(votes)) * sign(votes) + (age_in_seconds / 45000)
const EPOCH = new Date('2024-01-01').getTime();

export const calculateHotScore = (post) => {
    const votes = (post.voteCount || 0);
    const comments = (post.commentCount || 0);
    const created = post.createdAt?.getTime() || Date.now();

    // Time since epoch in seconds
    const ageInSeconds = (created - EPOCH) / 1000;

    // Calculate score similar to Reddit's hot algorithm
    const score = votes + (comments * 2); // Comments count double
    const order = Math.log10(Math.max(Math.abs(score), 1));
    const sign = score > 0 ? 1 : score < 0 ? -1 : 0;

    // Hot score: combines vote score with time
    return sign * order + ageInSeconds / 45000;
};

// Twitter-style trending: based on velocity (recent activity spike)
export const calculateTrendingScore = (post) => {
    const now = Date.now();
    const created = post.createdAt?.getTime() || now;
    const ageInHours = (now - created) / (1000 * 60 * 60);

    // Boost recent posts significantly
    if (ageInHours > 72) return 0; // Ignore posts older than 3 days

    const votes = (post.voteCount || 0);
    const comments = (post.commentCount || 0);

    // Velocity: engagement per hour
    const engagement = votes + (comments * 3);
    const velocity = engagement / Math.max(ageInHours, 0.5);

    // Trending score: higher for rapid engagement
    return velocity * (1 / (ageInHours + 1));
};

// Get trending categories/topics
export const getTrendingTopics = (posts) => {
    const categoryStats = {};

    posts.forEach(post => {
        const category = post.category || 'general';

        if (!categoryStats[category]) {
            categoryStats[category] = {
                category,
                postCount: 0,
                totalVotes: 0,
                totalComments: 0,
                avgHotScore: 0
            };
        }

        categoryStats[category].postCount++;
        categoryStats[category].totalVotes += (post.voteCount || 0);
        categoryStats[category].totalComments += (post.commentCount || 0);
        categoryStats[category].avgHotScore += calculateHotScore(post);
    });

    // Calculate average scores and sort by trending
    const topics = Object.values(categoryStats).map(stat => ({
        ...stat,
        avgHotScore: stat.avgHotScore / stat.postCount,
        trendingScore: (stat.totalVotes + stat.totalComments * 2) / stat.postCount
    }));

    // Sort by trending score
    return topics.sort((a, b) => b.trendingScore - a.trendingScore);
};

// Get hot posts (Reddit-style)
export const getHotPosts = (posts, limit = 10) => {
    return posts
        .map(post => ({
            ...post,
            hotScore: calculateHotScore(post)
        }))
        .sort((a, b) => b.hotScore - a.hotScore)
        .slice(0, limit);
};

// Get trending posts (Twitter-style)
export const getTrendingPosts = (posts, limit = 5) => {
    return posts
        .map(post => ({
            ...post,
            trendingScore: calculateTrendingScore(post)
        }))
        .filter(post => post.trendingScore > 0)
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, limit);
};
