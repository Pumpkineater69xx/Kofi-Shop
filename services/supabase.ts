import { CurbsideItem } from '../types';

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || '').trim();

// Validation
const isValidUrl = SUPABASE_URL.startsWith('http');
const isConfigured = isValidUrl && SUPABASE_ANON_KEY.length > 10;

if (!isConfigured) {
  console.warn("Supabase configuration missing or invalid. Using local storage mode.");
}

export async function fetchItemsFromCloud(): Promise<CurbsideItem[] | null> {
  if (!isConfigured) return null;
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/items?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
    return await response.json();
  } catch (e) {
    console.error('Supabase Sync Error:', e);
    return null;
  }
}

export async function saveItemToCloud(item: CurbsideItem): Promise<boolean> {
  if (!isConfigured) return false;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/items`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(item)
    });
    return response.ok;
  } catch (e) {
    console.error('Supabase Save Error:', e);
    return false;
  }
}

export async function updateItemInCloud(id: string, updates: Partial<CurbsideItem>): Promise<boolean> {
  if (!isConfigured) return false;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/items?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    return response.ok;
  } catch (e) {
    console.error('Supabase Update Error:', e);
    return false;
  }
}
