// Archetype avatar image mapping system
// Replace these placeholder paths with actual high-res avatar images

export const archetypeAvatars: Record<string, string> = {
  '火花塞': '/placeholder-avatar.png', // Replace with: import firestarterAvatar from '@assets/avatars/firestarter.png'
  '探索者': '/placeholder-avatar.png', // Replace with: import explorerAvatar from '@assets/avatars/explorer.png'
  '故事家': '/placeholder-avatar.png', // Replace with: import storytellerAvatar from '@assets/avatars/storyteller.png'
  '挑战者': '/placeholder-avatar.png', // Replace with: import challengerAvatar from '@assets/avatars/challenger.png'
  '连接者': '/placeholder-avatar.png', // Replace with: import connectorAvatar from '@assets/avatars/connector.png'
  '协调者': '/placeholder-avatar.png', // Replace with: import coordinatorAvatar from '@assets/avatars/coordinator.png'
  '氛围组': '/placeholder-avatar.png', // Replace with: import vibeAvatar from '@assets/avatars/vibe.png'
  '肯定者': '/placeholder-avatar.png', // Replace with: import affir merAvatar from '@assets/avatars/affirmer.png'
  // Add more archetypes as needed
};

// Gradient backgrounds for each archetype (used as fallback or background)
export const archetypeGradients: Record<string, string> = {
  '火花塞': 'from-orange-500 via-red-500 to-pink-500',
  '探索者': 'from-purple-500 via-indigo-500 to-blue-500',
  '故事家': 'from-green-500 via-teal-500 to-cyan-500',
  '挑战者': 'from-red-500 via-orange-600 to-yellow-500',
  '连接者': 'from-cyan-500 via-blue-500 to-indigo-500',
  '协调者': 'from-indigo-500 via-purple-500 to-pink-500',
  '氛围组': 'from-pink-500 via-fuchsia-500 to-purple-500',
  '肯定者': 'from-yellow-500 via-amber-500 to-orange-500',
};

// Large emoji as placeholder for high-res avatars
export const archetypeEmojis: Record<string, string> = {
  '火花塞': '🙌',
  '探索者': '🧭',
  '故事家': '🗣️',
  '挑战者': '💪',
  '连接者': '🤗',
  '协调者': '🧘',
  '氛围组': '🕺',
  '肯定者': '🙏',
};
