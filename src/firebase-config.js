// פרטי החיבור לפרויקט Firebase של צוות אדרת.
// הפרטים האלה לא סודיים (הם מופיעים בכל אפליקציית רשת), האבטחה היא בחוקים של Firestore.
// בתצוגה המקדימה (VITE_OFFLINE) האפליקציה עובדת בלי שרת
export const firebaseConfig = import.meta.env.VITE_OFFLINE ? null : {
  apiKey: 'AIzaSyDNBY4CayU_BflmMIfsfcmCsZn9f6vgepg',
  authDomain: 'tzevet-aderet.firebaseapp.com',
  projectId: 'tzevet-aderet',
  storageBucket: 'tzevet-aderet.firebasestorage.app',
  messagingSenderId: '767510096884',
  appId: '1:767510096884:web:d32a2fead24ff404ffa7a1',
}

// מפתח ציבורי להתראות Push (Cloud Messaging → Web Push certificates)
export const vapidKey = null
