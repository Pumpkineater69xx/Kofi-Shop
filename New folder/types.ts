
export type Category = 'Furniture' | 'Books' | 'Toys' | 'Electronics' | 'Clothing' | 'Other';

export interface UserProfile {
  name: string;
  animal: string;
  adjective: string;
  avatarColor: string;
}

export interface CurbsideItem {
  id: string;
  title: string;
  description: string;
  category: Category;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  createdAt: number;
  foundAt?: number; // Timestamp when the item was marked as found
  reporter: string;
  reporterAnimal?: string; // To show the reporter's avatar
  isFound: boolean;
}

export interface MapPosition {
  lat: number;
  lng: number;
}
