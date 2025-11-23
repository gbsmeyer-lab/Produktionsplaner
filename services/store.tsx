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
  writeBatch
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

  // Sorting helper to maintain PDF order
  const sortInventory = (items: InventoryItem[]) => {
    return items.sort((a, b) => {
        const idxA = INITIAL_INVENTORY.findIndex(i => i.id === a.id);
        const idxB = INITIAL_INVENTORY.findIndex(i => i.id === b.id);
        
        // If both are in the initial list, preserve that order
        if (idxA >= 0 && idxB >= 0) return idxA - idxB;
        
        // If one is in the list, it comes first (known items before custom items)
        if (idxA >= 0) return -1;
        if (idxB >= 0) return 1;
        
        // If neither exist (custom added items), sort by Category then Name
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return a.name.localeCompare(b.name);
      });
  };

  // --- Real-time Listeners (Firebase) ---
  useEffect(() => {
    // Capture db in a local variable for Type narrowing
    const firestore = db;

    // Safety Check: If DB is not connected (e.g. missing API keys), use local fallback
    if (!firestore) {
        console.warn("Database connection not established. Using local fallback data.");
        setInventory(INITIAL_INVENTORY);
        setIsLoading(false);
        return;
    }

    // 1. Listen to Inventory
    const unsubInventory = onSnapshot(collection(firestore, "inventory"), (snapshot) => {
      const items: InventoryItem[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as InventoryItem);
      });
      
      // Determine if we need to seed (empty server response)
      if (items.length === 0 && !snapshot.metadata.fromCache) {
         seedInventory();
      } 
      
      setInventory(sortInventory(items));
    });

    // 2. Listen to ShootPlans
    const unsubPlans = onSnapshot(collection(firestore, "shootPlans"), (snapshot) => {
      const items: ShootPlan[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as ShootPlan);
      });
      // Sort by newest first
      items.sort((a, b) => b.createdAt - a.createdAt);
      setShootPlans(items);
    });

    // 3. Listen to Bookings
    const unsubBookings = onSnapshot(collection(firestore, "bookings"), (snapshot) => {
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
    const firestore = db;
    if (!firestore) return;

    console.log("Seeding Database with initial inventory...");
    const batch = writeBatch(firestore);
    INITIAL_INVENTORY.forEach(item => {
      const ref = doc(firestore, "inventory", item.id);
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

  // --- Actions (Write to Firebase or Local State) ---

  const addInventoryItem = async (item: InventoryItem) => {
    const firestore = db;
    if (!firestore) {
        // Local Fallback
        setInventory(prev => sortInventory([...prev, item]));
        return;
    }
    // Optimistic UI updates are handled by the listener automatically
    await setDoc(doc(firestore, "inventory", item.id), item);
  };

  const updateInventoryItem = async (updatedItem: InventoryItem) => {
    const firestore = db;
    if (!firestore) {
        // Local Fallback
        setInventory(prev => sortInventory(prev.map(i => i.id === updatedItem.id ? updatedItem : i)));
        return;
    }
    await setDoc(doc(firestore, "inventory", updatedItem.id), updatedItem);
  };

  const createShootPlan = async (plan: ShootPlan, requestedItems: { itemId: string; count: number }[], customItems: CustomItem[]) => {
    const firestore = db;
    
    // Create objects
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

    if (!firestore) {
        // Local Fallback
        setShootPlans(prev => [plan, ...prev]);
        setBookings(prev => [...prev, newBooking]);
        return;
    }
    
    const batch = writeBatch(firestore);

    // 1. Create Shoot Plan
    const planRef = doc(firestore, "shootPlans", plan.id);
    batch.set(planRef, plan);

    // 2. Create Booking
    const bookingRef = doc(firestore, "bookings", newBooking.id);
    batch.set(bookingRef, newBooking);

    await batch.commit();
  };

  const updateBooking = async (updatedBooking: Booking) => {
    const firestore = db;
    if (!firestore) {
        // Local Fallback
        setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
        return;
    }
    await setDoc(doc(firestore, "bookings", updatedBooking.id), updatedBooking);
  };

  const deleteBooking = async (bookingId: string) => {
    const firestore = db;
    if (!firestore) {
        // Local Fallback
        setBookings(prev => prev.filter(b => b.id !== bookingId));
        return;
    }
    await deleteDoc(doc(firestore, "bookings", bookingId));
  };

  const deleteShootPlan = async (planId: string) => {
    const firestore = db;
    if (!firestore) {
        // Local Fallback
        setShootPlans(prev => prev.filter(p => p.id !== planId));
        setBookings(prev => prev.filter(b => b.planId !== planId));
        return;
    }
    
    const batch = writeBatch(firestore);
    
    // Delete the plan
    batch.delete(doc(firestore, "shootPlans", planId));

    // Find and delete associated bookings
    const associatedBookings = bookings.filter(b => b.planId === planId);
    associatedBookings.forEach(b => {
      batch.delete(doc(firestore, "bookings", b.id));
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