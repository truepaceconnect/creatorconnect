import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './ClientApp';

export const uploadImageToFirebase = async (file) => {
  if (!file) return null;

  try {
    // Create a unique filename with proper sanitization
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `content-images/${timestamp}-${sanitizedFilename}`;
    
    // Create storage reference
    const storageRef = ref(storage, filename);
    
    // Set proper metadata including content-type
    const metadata = {
      contentType: file.type,
      customMetadata: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      }
    };

    // Upload file with metadata
    const snapshot = await uploadBytes(storageRef, file, metadata);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};