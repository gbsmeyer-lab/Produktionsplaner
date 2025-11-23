import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InventoryItem, ShootPlan, Booking, BookingItem, CustomItem } from '../types';
import { INITIAL_INVENTORY } from '../constants';
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  writeBatch,
  query,
  where,
  getDocs
} from 'firebase/firestore';

interface AppState {
  inventory: InventoryItem[];
  shootPlans: ShootPlan[];
  bookings: Booking[];
  isAdmin: boolean;
  isDarkMode: boolean;
  isLoading: boolean;
}

interface AppContextType extends AppState {
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  createShootPlan: (plan: ShootPlan, requestedItems: { itemId: string; count: number }[], customItems: CustomItem[]) => void;
  updateBooking: (booking: Booking) => void;
  deleteBooking: (bookingId: string) => void;
  deleteShootPlan: (planId: string) => void;
  loginAdmin: () => void;
  logoutAdmin: () => void;
  getAvailableCount: (itemId: string) => number;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [shootPlans, setShootPlans] = useState<ShootPlan[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // --- Real-time Listeners (Firebase) ---
  useEffect(() => {
    // 1. Listen to Inventory
    const unsubInventory = onSnapshot(collection(db, "inventory"), (snapshot) => {
      const items: InventoryItem[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as InventoryItem);
      });
      
      // Seed DB if empty (First run only)
      if (items.length === 0 && !snapshot.metadata.fromCache) {
         seedInventory();
      } else {
         // Sort roughly by category to keep UI consistent
         items.sort((a, b) => a.category.localeCompare(b.category));
         setInventory(items);
      }
    });

    // 2. Listen to ShootPlans
    const unsubPlans = onSnapshot(collection(db, "shootPlans"), (snapshot) => {
      const items: ShootPlan[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as ShootPlan);
      });
      // Sort by newest first
      items.sort((a, b) => b.createdAt - a.createdAt);
      setShootPlans(items);
    });

    // 3. Listen to Bookings
    const unsubBookings = onSnapshot(collection(db, "bookings"), (snapshot) => {
      const items: Booking[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as Booking);
      });
      setBookings(items);
      setIsLoading(false);
    });

    // Theme handling (Local only)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    return () => {
      unsubInventory();
      unsubPlans();
      unsubBookings();
    };
  }, []);

  // Helper to seed the database if it's empty
  const seedInventory = async () => {
    console.log("Seeding Database with initial inventory...");
    const batch = writeBatch(db);
    INITIAL_INVENTORY.forEach(item => {
      const ref = doc(db, "inventory", item.id);
      batch.set(ref, item);
    });
    await batch.commit();
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

  // --- Actions (Write to Firebase) ---

  const addInventoryItem = async (item: InventoryItem) => {
    // Optimistic UI updates are handled by the listener automatically
    await setDoc(doc(db, "inventory", item.id), item);
  };

  const updateInventoryItem = async (updatedItem: InventoryItem) => {
    await setDoc(doc(db, "inventory", updatedItem.id), updatedItem);
  };

  const createShootPlan = async (plan: ShootPlan, requestedItems: { itemId: string; count: number }[], customItems: CustomItem[]) => {
    const batch = writeBatch(db);

    // 1. Create Shoot Plan
    const planRef = doc(db, "shootPlans", plan.id);
    batch.set(planRef, plan);

    // 2. Create Booking
    const bookingItems: BookingItem[] = requestedItems.map(req => ({
      itemId: req.itemId,
      requestedCount: req.count,
      handedOutCount: 0,
      returnedCount: 0,
      specificIds: [],
      notes: ''
    }));

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      planId: plan.id,
      items: bookingItems,
      customItems,
      status: 'pending'
    };

    const bookingRef = doc(db, "bookings", newBooking.id);
    batch.set(bookingRef, newBooking);

    await batch.commit();
  };

  const updateBooking = async (updatedBooking: Booking) => {
    await setDoc(doc(db, "bookings", updatedBooking.id), updatedBooking);
  };

  const deleteBooking = async (bookingId: string) => {
    await deleteDoc(doc(db, "bookings", bookingId));
  };

  const deleteShootPlan = async (planId: string) => {
    const batch = writeBatch(db);
    
    // Delete the plan
    batch.delete(doc(db, "shootPlans", planId));

    // Find and delete associated bookings
    const associatedBookings = bookings.filter(b => b.planId === planId);
    associatedBookings.forEach(b => {
      batch.delete(doc(db, "bookings", b.id));
    });

    await batch.commit();
  };

  const loginAdmin = () => setIsAdmin(true);
  const logoutAdmin = () => setIsAdmin(false);

  const getAvailableCount = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return 0;
    
    const activeBookings = bookings.filter(b => b.status === 'active' || b.status === 'pending');
    let used = 0;
    activeBookings.forEach(b => {
      const bItem = b.items.find(i => i.itemId === itemId);
      if (bItem) {
        used += Math.max(0, bItem.requestedCount - (bItem.returnedCount || 0));
      }
    });

    return item.totalStock - used;
  };

  return (
    <AppContext.Provider value={{
      inventory,
      shootPlans,
      bookings,
      isAdmin,
      isDarkMode,
      isLoading,
      addInventoryItem,
      updateInventoryItem,
      createShootPlan,
      updateBooking,
      deleteBooking,
      deleteShootPlan,
      loginAdmin,
      logoutAdmin,
      getAvailableCount,
      toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
