
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InventoryItem, ShootPlan, Booking, BookingItem, CustomItem } from '../types';
import { INITIAL_INVENTORY } from '../constants';

interface AppState {
  inventory: InventoryItem[];
  shootPlans: ShootPlan[];
  bookings: Booking[];
  isAdmin: boolean;
  isDarkMode: boolean;
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
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [shootPlans, setShootPlans] = useState<ShootPlan[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  // Default to Dark Mode (true)
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Load from local storage on mount
  useEffect(() => {
    const savedPlans = localStorage.getItem('shootPlans');
    const savedBookings = localStorage.getItem('bookings');
    const savedInventory = localStorage.getItem('inventory');
    
    if (savedInventory) {
       const parsedSavedInv = JSON.parse(savedInventory) as InventoryItem[];
       const mergedInventory = INITIAL_INVENTORY.map(initItem => {
         const savedItem = parsedSavedInv.find(s => s.id === initItem.id);
         if (savedItem) {
           return { ...initItem, maintenanceNotes: savedItem.maintenanceNotes };
         }
         return initItem;
       });
       const customCreatedItems = parsedSavedInv.filter(s => s.id.startsWith('new-'));
       setInventory([...mergedInventory, ...customCreatedItems]);
    } else {
       setInventory(INITIAL_INVENTORY);
    }
    
    const savedTheme = localStorage.getItem('theme');

    if (savedPlans) setShootPlans(JSON.parse(savedPlans));
    if (savedBookings) setBookings(JSON.parse(savedBookings));
    
    // Logic: If explicit 'light', set light. Otherwise default to dark (handled by init state true)
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      // Default or explicit dark
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('shootPlans', JSON.stringify(shootPlans));
    localStorage.setItem('bookings', JSON.stringify(bookings));
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [shootPlans, bookings, inventory]);

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

  const addInventoryItem = (item: InventoryItem) => {
    setInventory(prev => [...prev, item]);
  };

  const updateInventoryItem = (updatedItem: InventoryItem) => {
    setInventory(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
  };

  const createShootPlan = (plan: ShootPlan, requestedItems: { itemId: string; count: number }[], customItems: CustomItem[]) => {
    setShootPlans(prev => [...prev, plan]);

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

    setBookings(prev => [...prev, newBooking]);
  };

  const updateBooking = (updatedBooking: Booking) => {
    setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
  };

  const deleteBooking = (bookingId: string) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  const deleteShootPlan = (planId: string) => {
    setShootPlans(prev => prev.filter(p => p.id !== planId));
    setBookings(prev => prev.filter(b => b.planId !== planId));
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
