import { create } from "zustand";
import { auth, db } from "../config/firebase"; // Import auth and db
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const useAuthStore = create((set) => ({
    user: null,
    loading: true, // Add loading state to handle initial auth check
    setUser: (user) => set({ user, loading: false }),
    logout: () => {
        auth.signOut();
        set({ user: null, loading: false });
    },
    initializeAuth: () => {
        onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Check if the user is a student or teacher and fetch additional data
                const studentRef = doc(db, "students", firebaseUser.uid);
                const teacherRef = doc(db, "teachers", firebaseUser.uid);

                const studentSnap = await getDoc(studentRef);
                if (studentSnap.exists()) {
                    set({
                        user: { uid: firebaseUser.uid, role: "student", ...studentSnap.data() },
                        loading: false,
                    });
                    return;
                }

                const teacherSnap = await getDoc(teacherRef);
                if (teacherSnap.exists()) {
                    set({
                        user: { uid: firebaseUser.uid, role: "teacher", ...teacherSnap.data() },
                        loading: false,
                    });
                    return;
                }
            }
            // No user logged in
            set({ user: null, loading: false });
        });
    },
}));

// Initialize auth listener when the store is created
const store = useAuthStore.getState();
store.initializeAuth();

export default useAuthStore;