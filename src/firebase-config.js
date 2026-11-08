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
export const vapidKey = 'BJUVzNpfD1vp6SpYp2aIWja9xvi4QOHvWfRcGl5stGeFj5QuUE0D8KunhLReJBoCr6Z9Z7OVm3Y6SbIY3WmAhwM'

// שרת השליחה המיידית של ההתראות (Vercel). כל עוד אין כתובת, ההתראות נשלחות דרך GitHub באיחור של כמה דקות.
export const pushUrl = 'https://tzevet-aderet.vercel.app/api/push'
