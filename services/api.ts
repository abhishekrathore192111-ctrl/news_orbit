import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  increment 
} from 'firebase/firestore'; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';
import { db, auth, storage } from '../firebase';
import { User, NewsItem, NewsStatus, Language, SiteConfig } from '../types';

// --- Collection Names ---
const COLLECTIONS = {
  USERS: 'users',
  NEWS: 'news',
  CONFIG: 'siteConfig'
};

export const Api = {
  // --- SITE CONFIG ---
  getSiteConfig: async (): Promise<SiteConfig> => {
    try {
      const configDoc = await getDoc(doc(db, COLLECTIONS.CONFIG, 'main'));
      if (configDoc.exists()) {
        return configDoc.data() as SiteConfig;
      }
    } catch (e) {
      console.warn("Config fetch failed, check Firestore rules.", e);
    }

    return {
      siteName: 'Newsorbit India',
      logoUrl: 'https://i.imghippo.com/files/KyF9434tVI.jpeg',
      promotions: []
    };
  },

  updateSiteConfig: async (config: SiteConfig): Promise<void> => {
    await setDoc(doc(db, COLLECTIONS.CONFIG, 'main'), config);
  },

  // --- AUTHENTICATION ---
  login: async (email: string, pass: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid));

      if (!userDoc.exists()) throw new Error('User data not found in Firestore. Please register first.');
      const userData = userDoc.data() as User;

      if (userData.isBlocked) throw new Error('Your account is blocked.');
      if (userData.status === 'pending') throw new Error('Account pending approval. Please update status to "active" in Firebase Console.');
      if (userData.status === 'rejected') throw new Error('Account request rejected.');

      return userData;
    } catch (err: any) {
      console.error("Login Error Details:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password.');
      }
      throw err;
    }
  },

  register: async (userData: Omit<User, 'id' | 'role' | 'status'>): Promise<void> => {
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password || '');
    const uid = userCredential.user.uid;

    const newUser: User = {
      ...userData,
      id: uid,
      role: 'reporter',
      status: 'pending',
      isBlocked: false,
      canPost: false
    };

    delete newUser.password;
    await setDoc(doc(db, COLLECTIONS.USERS, uid), newUser);
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  // --- USER MANAGEMENT ---
  getAllUsers: async (): Promise<User[]> => {
    const q = query(collection(db, COLLECTIONS.USERS));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as User);
  },

  updateUserFields: async (userId: string, updates: Partial<User>): Promise<void> => {
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), updates);
  },

  updateUserStatus: async (userId: string, status: 'active' | 'rejected'): Promise<void> => {
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), { 
      status, 
      canPost: status === 'active' 
    });
  },

  // --- NEWS ---
  getNews: async (language: Language, categoryId?: string): Promise<NewsItem[]> => {
    try {
      let q;
      if (categoryId && categoryId !== 'top-news') {
        q = query(
          collection(db, COLLECTIONS.NEWS),
          where('status', '==', 'approved'),
          where('language', '==', language),
          where('category', '==', categoryId),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          collection(db, COLLECTIONS.NEWS),
          where('status', '==', 'approved'),
          where('language', '==', language),
          orderBy('createdAt', 'desc')
        );
      }

      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as NewsItem));
    } catch (e: any) {
      console.error("Fetch News Error:", e);
      return [];
    }
  },

  getNewsById: async (id: string): Promise<NewsItem | null> => {
    const newsDoc = await getDoc(doc(db, COLLECTIONS.NEWS, id));
    if (newsDoc.exists()) {
      try {
        await updateDoc(doc(db, COLLECTIONS.NEWS, id), { views: increment(1) });
      } catch {}
      return { id: newsDoc.id, ...(newsDoc.data() as object) } as NewsItem;
    }
    return null;
  },

  addNews: async (newsData: Record<string, any>, author: User): Promise<void> => {
    await addDoc(collection(db, COLLECTIONS.NEWS), {
      ...newsData,
      authorId: author.id,
      authorName: author.name,
      views: 0,
      createdAt: newsData.createdAt || new Date().toISOString()
    });
  },

  updateNews: async (id: string, newsData: Partial<NewsItem>): Promise<void> => {
    await updateDoc(doc(db, COLLECTIONS.NEWS, id), newsData);
  },

  getAllNewsAdmin: async (): Promise<NewsItem[]> => {
    const q = query(collection(db, COLLECTIONS.NEWS), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as NewsItem));
  },

  updateNewsStatus: async (id: string, status: NewsStatus): Promise<void> => {
    await updateDoc(doc(db, COLLECTIONS.NEWS, id), { status });
  },

  deleteNews: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.NEWS, id));
  },

  createUserAdmin: async (user: User): Promise<void> => {
    const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password || 'Temp123!');
    const newUser = { ...user, id: userCredential.user.uid };
    delete newUser.password;
    await setDoc(doc(db, COLLECTIONS.USERS, newUser.id), newUser);
  }
};

// --- OPTIMIZED IMAGE PROCESSING WITH PROGRESS ---
export const processImage = async (
  file: File, 
  onProgress?: (progress: number) => void
): Promise<string> => {
  // 1. रीसाइजिंग और कंप्रेसिंग (Blob में बदलना)
  const blob = await new Promise<Blob>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error("Canvas context failed"));
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error("Blob creation failed"));
        }, 'image/jpeg', 0.7);
      };
    };
  });

  // 2. Firebase Resumable Upload (Progress के साथ)
  return new Promise<string>((resolve, reject) => {
    const storageRef = ref(storage, `news_images/${Date.now()}_${file.name.replace(/\s+/g, '_')}`);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(Math.round(progress));
      }, 
      (error) => {
        console.error("Upload Error:", error);
        reject(new Error("अपलोड फेल हुआ! कृपया इंटरनेट चेक करें।"));
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};