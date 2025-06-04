import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { TeamMember, PressRelease } from '@/types';

const TEAM_MEMBERS_COLLECTION = 'team-members';
const PRESS_RELEASES_COLLECTION = 'press-releases';

// Team Member functions (existing)
// Get all team members
export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const q = query(collection(db, TEAM_MEMBERS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as TeamMember[];
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
}

// Get single team member
export async function getTeamMember(id: string): Promise<TeamMember | null> {
  try {
    const docRef = doc(db, TEAM_MEMBERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as TeamMember;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching team member:', error);
    throw error;
  }
}

// Add new team member
export async function addTeamMember(memberData: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, TEAM_MEMBERS_COLLECTION), {
      ...memberData,
      createdAt: now,
      updatedAt: now,
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding team member:', error);
    throw error;
  }
}

// Update team member
export async function updateTeamMember(id: string, memberData: Partial<Omit<TeamMember, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(db, TEAM_MEMBERS_COLLECTION, id);
    await updateDoc(docRef, {
      ...memberData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    throw error;
  }
}

// Delete team member
export async function deleteTeamMember(id: string): Promise<void> {
  try {
    const docRef = doc(db, TEAM_MEMBERS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting team member:', error);
    throw error;
  }
}

// Press Release functions (new)
// Get all press releases
export async function getPressReleases(publishedOnly: boolean = false): Promise<PressRelease[]> {
  try {
    let q;
    if (publishedOnly) {
      q = query(
        collection(db, PRESS_RELEASES_COLLECTION), 
        where('isPublished', '==', true),
        orderBy('publishDate', 'desc')
      );
    } else {
      q = query(collection(db, PRESS_RELEASES_COLLECTION), orderBy('createdAt', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      publishDate: doc.data().publishDate?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as PressRelease[];
  } catch (error) {
    console.error('Error fetching press releases:', error);
    throw error;
  }
}

// Get single press release
export async function getPressRelease(id: string): Promise<PressRelease | null> {
  try {
    const docRef = doc(db, PRESS_RELEASES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        publishDate: docSnap.data().publishDate?.toDate() || new Date(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as PressRelease;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching press release:', error);
    throw error;
  }
}

// Add new press release
export async function addPressRelease(releaseData: Omit<PressRelease, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, PRESS_RELEASES_COLLECTION), {
      ...releaseData,
      publishDate: Timestamp.fromDate(releaseData.publishDate),
      createdAt: now,
      updatedAt: now,
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding press release:', error);
    throw error;
  }
}

// Update press release
export async function updatePressRelease(id: string, releaseData: Partial<Omit<PressRelease, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(db, PRESS_RELEASES_COLLECTION, id);
    const updateData: any = {
      ...releaseData,
      updatedAt: Timestamp.now(),
    };
    
    // Convert publishDate to Timestamp if provided
    if (releaseData.publishDate) {
      updateData.publishDate = Timestamp.fromDate(releaseData.publishDate);
    }
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating press release:', error);
    throw error;
  }
}

// Delete press release
export async function deletePressRelease(id: string): Promise<void> {
  try {
    const docRef = doc(db, PRESS_RELEASES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting press release:', error);
    throw error;
  }
}

// Image upload functions (existing)
// Upload image to Firebase Storage
export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    // Sanitize filename to prevent encoding issues
    const sanitizedPath = path.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageRef = ref(storage, `images/${sanitizedPath}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Upload attachment to Firebase Storage
export async function uploadAttachment(file: File, path: string): Promise<string> {
  try {
    // Sanitize filename to prevent encoding issues
    const sanitizedPath = path.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageRef = ref(storage, `attachments/${sanitizedPath}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading attachment:', error);
    throw error;
  }
}

// Delete image from Firebase Storage
export async function deleteImage(url: string): Promise<void> {
  try {
    const imageRef = ref(storage, url);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
} 