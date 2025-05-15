
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
    }
  } catch (error) {
    console.error('Error setting up storage:', error);
  }
};

// Initialize storage on load
setupStorage();
