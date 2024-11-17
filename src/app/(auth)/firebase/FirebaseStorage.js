import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './ClientApp';

export const uploadImageToFirebase = async (file) => {
    if (!file) return null;
    
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `content-images/${timestamp}-${file.name}`;
      const storageRef = ref(storage, filename);
  
      // Upload file to Firebase Storage
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };