
import { supabase } from './client';

// Function to create the required storage buckets if they don't exist
export const setupStorage = async () => {
  try {
    // Check if the images bucket exists
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();
    
    if (listError) {
      console.error('Error checking buckets:', listError);
      return;
    }
    
    const imagesBucketExists = buckets?.some(bucket => bucket.name === 'images');
    
    if (!imagesBucketExists) {
      // Create the images bucket
      const { error: createError } = await supabase
        .storage
        .createBucket('images', {
          public: true, // Make bucket public
          fileSizeLimit: 5242880, // 5MB
        });
      
      if (createError) {
        console.error('Error creating images bucket:', createError);
      } else {
        console.log('Created images bucket');
      }
    } else {
      // Update bucket policies
      try {
        // Ensure bucket is public
        const { error: updateError } = await supabase
          .storage
          .updateBucket('images', { public: true });
        
        if (updateError) {
          console.error('Error updating images bucket:', updateError);
        }
      } catch (e) {
        console.error('Error setting bucket policies:', e);
      }
    }
  } catch (error) {
    console.error('Error setting up storage:', error);
  }
};

// Initialize storage on load
setupStorage();

// Helper function to check if file exists in storage
export const checkFileExists = async (bucket: string, path: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.storage.from(bucket).list(path.split('/').slice(0, -1).join('/'), {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });
    
    if (error) {
      console.error('Error checking if file exists:', error);
      return false;
    }
    
    const fileName = path.split('/').pop();
    return data.some(item => item.name === fileName);
  } catch (error) {
    console.error('Error in checkFileExists:', error);
    return false;
  }
};

