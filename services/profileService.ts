
import { UserProfile } from '../types';

const ADJECTIVES = [
  'Radiant', 'Mighty', 'Clever', 'Gentle', 'Sleepy', 'Quick', 'Happy', 'Brave', 
  'Curious', 'Swift', 'Golden', 'Silver', 'Zesty', 'Calm', 'Wandering', 'Kind'
];

const ANIMALS = [
  { name: 'Fox', icon: '🦊' },
  { name: 'Bear', icon: '🐻' },
  { name: 'Owl', icon: '🦉' },
  { name: 'Rabbit', icon: '🐰' },
  { name: 'Wolf', icon: '🐺' },
  { name: 'Panda', icon: '🐼' },
  { name: 'Lion', icon: '🦁' },
  { name: 'Tiger', icon: '🐯' },
  { name: 'Frog', icon: '🐸' },
  { name: 'Deer', icon: '🦌' }
];

const COLORS = [
  'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 
  'bg-purple-400', 'bg-pink-400', 'bg-indigo-400', 'bg-orange-400'
];

export function generateRandomProfile(): UserProfile {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];

  return {
    adjective: adj,
    animal: animal.name,
    name: `${adj} ${animal.name}`,
    avatarColor: color
  };
}

export function getAnimalIcon(animalName: string): string {
  return ANIMALS.find(a => a.name === animalName)?.icon || '🐾';
}
