export type Species = 'dog' | 'cat' | 'bird';
export type PetStatus = 'available' | 'adopted' | 'unavailable';
export type Trait = 'castrated' | 'vaccinated' | 'good_with_dogs' | 'good_with_cats' | 'affectionate';
export interface PublicProfile { id: string; display_name: string; organization_name?: string; avatar_url?: string; }
export interface Profile extends PublicProfile { full_name: string; email: string; phone: string; address: string; profile_type: 'adopter' | 'guardian' | 'ong'; created_at: string; }
export interface Pet { id: string; owner_id: string; name: string; species: Species; breed: string; sex: 'male' | 'female'; size: 'small' | 'medium' | 'large'; age_group: 'puppy' | 'young' | 'adult' | 'senior'; age_text: string; region: string; city: string; description: string; health_notes: string; behavior: string; traits: Trait[]; photo_urls: string[]; status: PetStatus; created_at: string; }
export interface PetContact { pet_id: string; contact_phone: string; }
export interface Favorite { user_id: string; pet_id: string; }
export interface Interest { id: string; user_id: string; pet_id: string; message: string; created_at: string; }
export interface PetFilters { species: string; age_group: string; sex: string; size: string; region: string; traits: Trait[]; }
export type PetDraft = Omit<Pet, 'id' | 'owner_id' | 'created_at'> & { contact_phone: string };
export interface AppSnapshot { pets: Pet[]; profile: Profile | null; favorites: Favorite[]; interests: Interest[]; contacts: PetContact[]; signedIn: boolean; }
export const emptyFilters: PetFilters = { species: '', age_group: '', sex: '', size: '', region: '', traits: [] };
