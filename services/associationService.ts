import { supabase } from '../supabaseClient';
import { Association } from '../types';

// Services for handling association data

// Fetch all associations
export const fetchAssociations = async (): Promise<Association[]> => {
  try {
    const { data, error } = await supabase
      .from('associations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching associations:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchAssociations:', error);
    return [];
  }
};

// Create new association
export const createAssociation = async (association: Omit<Association, 'id' | 'created_at' | 'updated_at'>): Promise<Association> => {
  try {
    const { data, error } = await supabase
      .from('associations')
      .insert([association])
      .select()
      .single();

    if (error) {
      console.error('Error creating association:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createAssociation:', error);
    throw error;
  }
};

// Update association
export const updateAssociation = async (id: string, updates: Partial<Association>): Promise<Association> => {
  try {
    const { data, error } = await supabase
      .from('associations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating association:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateAssociation:', error);
    throw error;
  }
};

// Update multiple associations
export const updateMultipleAssociations = async (ids: string[], updates: Partial<Association>): Promise<Association[]> => {
  try {
    const { data, error } = await supabase
      .from('associations')
      .update(updates)
      .in('id', ids)
      .select();

    if (error) {
      console.error('Error updating multiple associations:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in updateMultipleAssociations:', error);
    throw error;
  }
};

// Delete association
export const deleteAssociation = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('associations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting association:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteAssociation:', error);
    throw error;
  }
};

// Delete multiple associations
export const deleteMultipleAssociations = async (ids: string[]): Promise<void> => {
  try {
    const { error } = await supabase
      .from('associations')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Error deleting multiple associations:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteMultipleAssociations:', error);
    throw error;
  }
};

// Search associations with filters
export const searchAssociations = async (filters: {
  searchTerm?: string;
  status?: string;
  region?: string;
  category?: string;
}): Promise<Association[]> => {
  try {
    let query = supabase
      .from('associations')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.region) {
      query = query.eq('region', filters.region);
    }

    if (filters.category) {
      query = query.eq('sub_category', filters.category);
    }

    if (filters.searchTerm) {
      query = query.or(
        `name.ilike.%${filters.searchTerm}%,city.ilike.%${filters.searchTerm}%,region.ilike.%${filters.searchTerm}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error searching associations:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchAssociations:', error);
    return [];
  }
};

// Import associations from file
export const importAssociations = async (associations: Omit<Association, 'id' | 'created_at' | 'updated_at'>[]): Promise<Association[]> => {
  try {
    const { data, error } = await supabase
      .from('associations')
      .insert(associations)
      .select();

    if (error) {
      console.error('Error importing associations:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in importAssociations:', error);
    throw error;
  }
};
