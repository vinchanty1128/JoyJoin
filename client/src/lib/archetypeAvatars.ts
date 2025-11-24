// 12-Archetype Animal Social Vibe System
// Avatar image mapping system with high-res illustrations

import corgiImg from '@assets/开心柯基_1763997660297.png';
import chickenImg from '@assets/太阳鸡_1763997660294.png';
import dolphinImg from '@assets/夸夸豚_1763997660288.png';
import foxImg from '@assets/机智狐_1763997660293.png';
import calmDolphinImg from '@assets/淡定海豚_1763997660293.png';
import spiderImg from '@assets/织网蛛_1763997660291.png';
import bearImg from '@assets/暖心熊_1763997660292.png';
import octopusImg from '@assets/灵感章鱼_1763997660292.png';
import owlImg from '@assets/沉思猫头鹰_1763997660294.png';
import elephantImg from '@assets/定心大象_1763997660293.png';
import turtleImg from '@assets/稳如龟_1763997660291.png';
import catImg from '@assets/隐身猫_1763997660297.png';

export const archetypeAvatars: Record<string, string> = {
  '开心柯基': corgiImg,
  '太阳鸡': chickenImg,
  '夸夸豚': dolphinImg,
  '机智狐': foxImg,
  '淡定海豚': calmDolphinImg,
  '织网蛛': spiderImg,
  '暖心熊': bearImg,
  '灵感章鱼': octopusImg,
  '沉思猫头鹰': owlImg,
  '定心大象': elephantImg,
  '稳如龟': turtleImg,
  '隐身猫': catImg,
};

// Gradient backgrounds for each archetype (energy-based color mapping)
export const archetypeGradients: Record<string, string> = {
  '开心柯基': 'from-yellow-500 via-orange-500 to-red-500',      // High energy
  '太阳鸡': 'from-amber-500 via-yellow-500 to-orange-500',       // High energy
  '夸夸豚': 'from-cyan-500 via-blue-500 to-indigo-500',         // High energy
  '机智狐': 'from-orange-500 via-red-500 to-pink-500',          // High energy
  '淡定海豚': 'from-blue-500 via-indigo-500 to-purple-500',      // Medium energy
  '织网蛛': 'from-purple-500 via-pink-500 to-fuchsia-500',      // Medium energy
  '暖心熊': 'from-rose-500 via-pink-500 to-red-500',            // Medium energy
  '灵感章鱼': 'from-violet-500 via-purple-500 to-indigo-500',    // Medium energy
  '沉思猫头鹰': 'from-slate-500 via-gray-500 to-zinc-500',        // Low energy
  '定心大象': 'from-gray-500 via-slate-500 to-stone-500',        // Low energy
  '稳如龟': 'from-green-500 via-emerald-500 to-teal-500',       // Very low energy
  '隐身猫': 'from-indigo-500 via-purple-500 to-violet-500',     // Very low energy
};

// Animal emoji avatars (primary visual representation)
export const archetypeEmojis: Record<string, string> = {
  '开心柯基': '🐕',
  '太阳鸡': '🐓',
  '夸夸豚': '🐬',
  '机智狐': '🦊',
  '淡定海豚': '🐬',
  '织网蛛': '🕷️',
  '暖心熊': '🐻',
  '灵感章鱼': '🐙',
  '沉思猫头鹰': '🦉',
  '定心大象': '🐘',
  '稳如龟': '🐢',
  '隐身猫': '🐱',
};
