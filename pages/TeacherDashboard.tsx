import React, { useState, useMemo } from 'react';
import { useApp } from '../services/store';
import { ClassName, Booking, InventoryItem, BookingItem } from '../types';
import { SignatureCanvas } from '../components/SignatureCanvas';
import { ConfirmModal } from '../components/ConfirmModal';
import { Calendar, MapPin, CheckSquare, Trash2, Plus, Box, Check, Filter, Package, User, Phone, Clock, ArrowLeft, ArrowDownCircle, AlertTriangle, Printer, CheckCircle, Edit, X, PenTool, AlertCircle } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { bookings, shootPlans, inventory, updateBooking, deleteShootPlan, addInventoryItem, updateInventoryItem, getAvailableCount } = useApp();
  
  const [view, setView] = useState<'dashboard' | 'handover' | 'inventory' | 'details' | 'return'>('dashboard');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filterClass, setFilterClass] = useState<string>('all');
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  
  // Inventory form state
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({ category: 'Kamera', name: '', totalStock: 1 });
  const [isNewItemCustomCat, setIsNewItemCustomCat] = useState(false);

  // Edit Inventory State
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isEditingCustomCat, setIsEditingCustomCat] = useState(false);

  // Get active shoots including packed ones
  const activeBookings = bookings.filter(b => b.status === 'active' || b.status === 'pending' || b.status === 'returned' || b.status === 'packed');
  
  const getPlan = (planId: string) => shootPlans.find(p => p.id === planId);

  const filteredBookings = activeBookings.filter(b => {
    if (filterClass === 'all') return true;
    const plan = getPlan(b.planId);
    return plan?.className === filterClass;
  });

  // Calculate unique categories from inventory
  const uniqueCategories = useMemo(() => {
    const cats = new Set(inventory.map(i => i.category));
    // Ensure default categories exist if inventory is empty (fallback)
    if (cats.size === 0) return ['Kamera', 'Objektiv', 'Licht', 'Audio', 'Zubehör'];
    return Array.from(cats).sort();
  }, [inventory]);

  // Helper: Sort items by inventory order
  const sortBookingItems = (items: BookingItem[]) => {
    return [...items].sort((a, b) => {
        const indexA = inventory.findIndex(i => i.id === a.itemId);
        const indexB = inventory.findIndex(i => i.id === b.itemId);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
  };

  // --- Handover Logic ---
  const handleHandoverUpdate = (booking: Booking, itemId: string, updates: { specificId?: string, notes?: string, toggleStatus?: boolean }) => {
    const newItems = [...booking.items];
    const itemIndex = newItems.findIndex(i => i.itemId === itemId);
    if (itemIndex === -1) return;

    const item = newItems[itemIndex];
    
    if (updates.toggleStatus) {
      // Toggle between 0 and Requested count
      item.handedOutCount = item.handedOutCount >= item.requestedCount ? 0 : item.requestedCount;
    }
    if (updates.specificId !== undefined) item.specificIds = [updates.specificId]; 
    if (updates.notes !== undefined) item.notes = updates.notes;
    
    const updated: Booking = { ...booking, items: newItems };
    updateBooking(updated);
    setSelectedBooking(updated);
  };

  const handleSignature = (dataUrl: string) => {
    if (selectedBooking) {
      const updated: Booking = { 
        ...selectedBooking, 
        signature: dataUrl, 
        handoutDate: Date.now()
      };
      updateBooking(updated);
      setSelectedBooking(updated); 
    }
  };

  const savePackedState = () => {
    if (selectedBooking) {
        // Just save status as 'packed', no signature needed
        const updated: Booking = { ...selectedBooking, status: 'packed' };
        updateBooking(updated);
        setSelectedBooking(null);
        setView('dashboard');
    }
  };

  const finishHandover = () => {
    if (selectedBooking) {
        const updated: Booking = { ...selectedBooking, status: 'active' };
        updateBooking(updated);
        setSelectedBooking(null);
        setView('dashboard');
    }
  };

  // --- Return Logic ---
  const handleReturnUpdate = (booking: Booking, itemId: string, isReturned: boolean) => {
    const newItems = [...booking.items];
    const itemIndex = newItems.findIndex(i => i.itemId === itemId);
    if (itemIndex === -1) return;

    const item = newItems[itemIndex];
    // Only return what was handed out
    item.returnedCount = isReturned ? item.handedOutCount : 0;

    // Check if ALL items are returned now (based on handed out count)
    const allReturned = newItems.every(i => i.returnedCount >= i.handedOutCount);

    const updated: Booking = { 
        ...booking, 
        items: newItems,
        status: allReturned ? 'returned' : 'active' 
    };
    updateBooking(updated);
    setSelectedBooking(updated);
  };

  const handleMaintenanceNote = (itemId: string, note: string) => {
      const invItem = inventory.find(i => i.id === itemId);
      if (invItem) {
          updateInventoryItem({ ...invItem, maintenanceNotes: note });
      }
  };

  const checkAllReturned = (booking: Booking) => {
      // Helper to quickly check all
      const newItems = booking.items.map(item => ({
          ...item,
          returnedCount: item.handedOutCount // Set to handed out count
      }));
      
      const updated: Booking = { 
          ...booking, 
          items: newItems,
          status: 'returned' // Automatically set status
      };
      updateBooking(updated);
      setSelectedBooking(updated);
  };

  // --- PDF Generation (New Tab) ---
  const handleOpenPrintWindow = (booking: Booking) => {
      const plan = getPlan(booking.planId);
      if (!plan) return;
      const sortedItems = sortBookingItems(booking.items);

      const win = window.open('', '_blank');
      if (!win) {
          alert("Bitte Pop-ups erlauben.");
          return;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Lieferschein_${plan.className}_Gr${plan.groupLetter}</title>
          <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #000; max-width: 800px; margin: 0 auto; }
            h1 { text-transform: uppercase; font-size: 24px; margin: 0 0 5px 0; letter-spacing: 1px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .meta-info { text-align: right; font-size: 14px; }
            
            .section { margin-bottom: 30px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 14px; }
            
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th { text-align: left; border-bottom: 2px solid #000; padding: 8px 4px; font-weight: bold; text-transform: uppercase; font-size: 11px; }
            td { border-bottom: 1px solid #eee; padding: 8px 4px; vertical-align: top; }
            .qty-col { width: 50px; font-weight: bold; font-size: 14px; }
            .check-col { width: 40px; text-align: right; }
            .check-box { width: 14px; height: 14px; border: 1px solid #000; display: inline-block; }
            .check-box.checked { background: #000; }
            
            .notes { font-size: 11px; font-style: italic; color: #444; margin-top: 2px; }
            .id-tag { font-family: monospace; font-size: 11px; background: #eee; padding: 1px 4px; border-radius: 3px; margin-right: 4px; }
            
            .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #000; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; font-size: 14px; }
            .sig-box { height: 60px; margin-top: 10px; }
            .sig-img { height: 50px; object-fit: contain; }

            @media print {
              .no-print { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="background: #eef2ff; border: 1px solid #c7d2fe; padding: 10px; text-align: center; margin-bottom: 20px; font-family: sans-serif;">
             <button onclick="window.print()" style="background: #3730a3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">Drucken / PDF Speichern</button>
          </div>

          <div class="header">
            <div>
              <h1>Lieferschein / Packliste</h1>
              <p style="margin:0; font-size: 14px; color: #444;">Ausleihe Medientechnik</p>
            </div>
            <div class="meta-info">
              <p><strong>${plan.className}</strong> - Gruppe ${plan.groupLetter}</p>
              <p>${new Date().toLocaleDateString('de-DE')}</p>
            </div>
          </div>

          <div class="section grid-2">
             <div>
                <strong>Projekt:</strong> ${plan.projectType}<br/>
                ${plan.projectTopic ? `<em>${plan.projectTopic}</em><br/>` : ''}
                <strong>Team:</strong> ${plan.members.map(m => m.name).join(', ')}
             </div>
             <div style="text-align: right;">
                <strong>Rückgabe:</strong> ${plan.returnDate ? new Date(plan.returnDate).toLocaleDateString('de-DE') : '-'}<br/>
                <strong>Kontakt:</strong> ${plan.contactPhone}
             </div>
          </div>

          <div class="section">
             <table>
               <thead>
                 <tr>
                   <th class="qty-col">Anz.</th>
                   <th>Gerät / Bezeichnung</th>
                   <th>Kategorie</th>
                   <th class="check-col">Out</th>
                 </tr>
               </thead>
               <tbody>
                 ${sortedItems.filter(i => i.handedOutCount > 0).map(item => {
                    const invItem = inventory.find(i => i.id === item.itemId);
                    return `
                      <tr>
                        <td class="qty-col">${item.handedOutCount}x</td>
                        <td>
                           <div style="font-weight: bold;">${invItem?.name}</div>
                           ${item.specificIds && item.specificIds.length > 0 ? `<div>${item.specificIds.map(id => `<span class="id-tag">${id}</span>`).join('')}</div>` : ''}
                           ${item.notes ? `<div class="notes">Note: ${item.notes}</div>` : ''}
                        </td>
                        <td>${invItem?.category}</td>
                        <td class="check-col"><div class="check-box checked"></div></td>
                      </tr>
                    `;
                 }).join('')}
                 ${booking.customItems.map(ci => `
                    <tr>
                        <td class="qty-col">${ci.count}x</td>
                        <td>${ci.name} <span style="font-size:11px;">(Zusatz)</span></td>
                        <td>Sonstiges</td>
                        <td class="check-col"><div class="check-box checked"></div></td>
                    </tr>
                 `).join('')}
               </tbody>
             </table>
          </div>

          <div class="footer">
             <div>
                 Unterschrift Ausgabe (Lehrer):
                 <div class="sig-box" style="border-bottom: 1px dotted #000;"></div>
             </div>
             <div>
                 Unterschrift Empfang (Schüler):
                 <div class="sig-box" style="border-bottom: 1px dotted #000;">
                    ${booking.signature ? `<img src="${booking.signature}" class="sig-img" />` : ''}
                 </div>
             </div>
          </div>
        </body>
        </html>
      `;

      win.document.write(htmlContent);
      win.document.close();
      win.focus();
  };

  // --- Inventory Management ---
  const handleAddItem = () => {
    if (newItem.name && newItem.category) {
      addInventoryItem({
        id: `new-${Date.now()}`,
        category: newItem.category!,
        name: newItem.name!,
        totalStock: newItem.totalStock || 1,
        link: newItem.link
      });
      // Reset form
      setNewItem({ category: uniqueCategories[0] || 'Kamera', name: '', totalStock: 1 });
      setIsNewItemCustomCat(false);
    }
  };

  const handleUpdateItem = () => {
    if (editingItem && editingItem.name && editingItem.category) {
      updateInventoryItem(editingItem);
      setEditingItem(null);
      setIsEditingCustomCat(false);
    }
  };

  const confirmDelete = () => {
    if (bookingToDelete) {
        deleteShootPlan(bookingToDelete.planId);
        setBookingToDelete(null);
    }
  };

  // Styles
  const cardClass = "bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-shadow duration-200 relative";
  const inputClass = "w-full border rounded p-2 text-sm bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white";

  // --- RENDER VIEWS ---

  // 1. Logistics Details
  if (view === 'details' && selectedBooking) {
    const plan = getPlan(selectedBooking.planId);
    if (!plan) return <div>Plan not found</div>;

    return (
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg animate-fade-in transition-colors duration-200">
        <button onClick={() => { setSelectedBooking(null); setView('dashboard'); }} className="mb-6 text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
           <ArrowLeft size={16}/> Zurück zum Dashboard
        </button>
        {/* Same details view as before */}
        <div className="flex justify-between items-start border-b dark:border-slate-700 pb-6 mb-6">
          <div>
            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm font-bold rounded mb-2">{plan.className}</span>
            <h2 className="text-3xl font-bold dark:text-white mb-1">Gruppe {plan.groupLetter}</h2>
            {plan.projectTopic && <h3 className="text-xl font-medium italic text-slate-600 dark:text-slate-300 mb-1">"{plan.projectTopic}"</h3>}
            <p className="text-lg text-gray-600 dark:text-gray-400">{plan.projectType}</p>
          </div>
          <div className="text-right">
             <div className="text-sm text-gray-500 dark:text-gray-400">Erstellt am</div>
             <div className="font-medium dark:text-gray-200">{new Date(plan.createdAt).toLocaleDateString('de-DE')}</div>
             {plan.id !== shootPlans.find(p => p.id === plan.id)?.id /* Force re-render if updated? No, just check types */ }
             {/* Note: plan is derived from state, so it is current. Check for updatedAt */}
             {/* Using 'any' cast to access extended type if not strictly updated in type def locally in this scope, but it is in store types */}
             {(plan as any).updatedAt && (
                <div className="text-xs text-gray-400 mt-1">
                    Aktualisiert: {new Date((plan as any).updatedAt).toLocaleDateString('de-DE')}
                </div>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
           <div className="bg-slate-50 dark:bg-slate-700/30 p-6 rounded-lg border dark:border-slate-600">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 dark:text-white"><Clock size={20}/> Zeitplan & Kontakt</h3>
              <div className="space-y-4">
                  <div>
                    <span className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold block mb-1">Rückgabe</span>
                    <span className="text-lg font-medium dark:text-white">{plan.returnDate ? new Date(plan.returnDate).toLocaleDateString('de-DE') : 'Nicht angegeben'}</span>
                  </div>
                  {(plan.storageDates || []).length > 0 ? (
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded border border-orange-200 dark:border-orange-800">
                      <span className="text-xs uppercase text-orange-700 dark:text-orange-400 font-bold block mb-1 flex items-center gap-1"><Package size={14}/> Zwischenlagerung</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {(plan.storageDates || []).map(d => (
                           <span key={d} className="bg-white dark:bg-slate-800 px-2 py-1 rounded text-sm font-medium shadow-sm dark:text-gray-200">{new Date(d).toLocaleDateString('de-DE')}</span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                        <span className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold">Zwischenlagerung</span>
                        <span className="text-gray-400 italic text-sm">Keine geplant</span>
                    </div>
                  )}
                  <div className="pt-2 border-t dark:border-slate-600">
                    <span className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold block mb-1">Notfall Kontakt</span>
                    <div className="flex items-center gap-2 text-lg font-medium dark:text-white">
                        <Phone size={18} className="text-green-600"/>
                        {plan.contactPhone || 'Keine Nummer'}
                    </div>
                  </div>
              </div>
           </div>
           <div className="bg-slate-50 dark:bg-slate-700/30 p-6 rounded-lg border dark:border-slate-600">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 dark:text-white"><User size={20}/> Team</h3>
              <div className="space-y-3">
                 {plan.members.map((m, i) => (
                    <div key={i} className="flex justify-between items-center border-b dark:border-slate-600 last:border-0 pb-2 last:pb-0">
                        <span className="font-medium dark:text-white">{m.name}</span>
                        <span className="text-sm bg-white dark:bg-slate-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 border dark:border-slate-600">{m.role}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700/30 p-6 rounded-lg border dark:border-slate-600">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 dark:text-white"><MapPin size={20}/> Drehorte</h3>
            <div className="space-y-4">
                {plan.locations.map((loc, i) => (
                    <div key={i} className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded border dark:border-slate-600">
                        <div className="flex-1">
                            <span className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold">Ort / Adresse</span>
                            <div className="font-medium dark:text-white">{loc.address}</div>
                        </div>
                        <div className="md:w-1/4">
                            <span className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold">Datum</span>
                            <div className="dark:text-gray-200">{loc.date ? new Date(loc.date).toLocaleDateString('de-DE') : '-'}</div>
                        </div>
                        <div className="md:w-1/4">
                            <span className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold">Zeit</span>
                            <div className="dark:text-gray-200">{loc.timeStart} - {loc.timeEnd} Uhr</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  }
  
  // 2. Handover View (Checklist)
  if (view === 'handover' && selectedBooking) {
    const plan = getPlan(selectedBooking.planId);
    if (!plan) return <div>Plan not found</div>;

    const sortedBookingItems = sortBookingItems(selectedBooking.items);
    const hasSignature = !!selectedBooking.signature;
    const isPacked = selectedBooking.status === 'packed';

    return (
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg animate-fade-in transition-colors duration-200 pb-32">
        <button onClick={() => { setSelectedBooking(null); setView('dashboard'); }} className="mb-4 text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"><ArrowLeft size={16}/> Zurück zum Dashboard</button>
        <div className="mb-6 border-b dark:border-slate-700 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold dark:text-white">{plan.className} - Gruppe {plan.groupLetter}</h2>
                {plan.projectTopic && <p className="text-lg italic text-slate-600 dark:text-slate-300">"{plan.projectTopic}"</p>}
                <p className="text-gray-600 dark:text-gray-400">{plan.projectType} <span className="mx-2">|</span> Geräteausgabe</p>
                {isPacked && <span className="inline-block mt-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold border border-orange-200">Bereits gepackt / Bereit zur Übergabe</span>}
              </div>
              <button 
                  onClick={() => handleOpenPrintWindow(selectedBooking)}
                  className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 px-3 py-2 rounded text-sm text-gray-700 dark:text-gray-200 transition-colors"
                  title="Packliste drucken"
              >
                  <Printer size={16} /> Packliste
              </button>
            </div>
        </div>

        <div className="space-y-6">
            <h3 className="font-bold text-lg dark:text-white">Geräteausgabe</h3>
            {sortedBookingItems.map((bItem) => {
                const invItem = inventory.find(i => i.id === bItem.itemId);
                const isChecked = bItem.handedOutCount >= bItem.requestedCount;
                
                return (
                    <div key={bItem.itemId} className={`p-4 border rounded-lg transition-colors ${isChecked ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-white dark:bg-slate-800 dark:border-slate-700'}`}>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="flex-shrink-0">
                                <span className="text-xl font-bold dark:text-white bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded">{bItem.requestedCount}x</span>
                            </div>
                            <div className="flex-grow">
                                <h4 className="font-semibold text-lg dark:text-white">{invItem?.name || 'Unbekanntes Item'}</h4>
                                <span className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">{invItem?.category}</span>
                            </div>
                            <div className="flex-shrink-0">
                                <button 
                                    onClick={() => handleHandoverUpdate(selectedBooking, bItem.itemId, { toggleStatus: true })}
                                    className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors border ${isChecked 
                                    ? 'bg-green-600 text-white border-green-700 hover:bg-green-700' 
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                >
                                    {isChecked ? 'Gepackt' : 'Packen'}
                                    {isChecked && <Check size={16}/>} 
                                </button>
                            </div>
                        </div>
                        {/* Note Input inside Handover */}
                        <div className="mt-2 border-t dark:border-slate-700/50 pt-2">
                            <input 
                                type="text"
                                placeholder="Notiz für Packliste (z.B. Seriennr., Kratzer...)"
                                value={bItem.notes || ''}
                                onChange={(e) => handleHandoverUpdate(selectedBooking, bItem.itemId, { notes: e.target.value })}
                                className="w-full text-sm bg-transparent border-b border-gray-200 dark:border-slate-600 focus:border-blue-500 focus:outline-none py-1 text-gray-600 dark:text-gray-300"
                            />
                        </div>
                    </div>
                );
            })}

            {selectedBooking.customItems.length > 0 && (
                 <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded border border-yellow-200 dark:border-yellow-800/50">
                    <h4 className="font-bold mb-2 dark:text-yellow-500">Zusätzliche Items</h4>
                    <ul className="list-disc pl-5 dark:text-gray-300">
                        {selectedBooking.customItems.map((ci, i) => <li key={i}>{ci.count}x {ci.name}</li>)}
                    </ul>
                </div>
            )}

            <div className="mt-8 border-t dark:border-slate-700 pt-6">
                <h3 className="font-bold text-lg mb-2 dark:text-white">Unterschrift (Schüler)</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Mit der Unterschrift wird der Erhalt bestätigt. Erst danach kann die Ausgabe finalisiert werden.</p>
                {selectedBooking.signature ? (
                    <div className="bg-white p-4 border rounded relative">
                        <img src={selectedBooking.signature} alt="Signature" className="h-[100px]"/>
                        <div className="absolute top-2 right-2 text-green-600 flex items-center gap-1 font-bold text-sm bg-green-50 px-2 py-1 rounded"><Check size={14}/> Unterschrieben</div>
                        <button onClick={() => updateBooking({...selectedBooking, signature: undefined})} className="text-xs text-red-500 hover:underline mt-2">Neu unterschreiben</button>
                    </div>
                ) : (
                    <div className="bg-white p-1 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600">
                        <SignatureCanvas onEnd={handleSignature} />
                    </div>
                )}
            </div>
            
            {/* Action Bar sticking to bottom */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t dark:border-slate-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex flex-col sm:flex-row justify-end gap-3 container mx-auto z-50">
                 
                 <button 
                    onClick={savePackedState}
                    className="px-6 py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 bg-orange-100 text-orange-800 hover:bg-orange-200 border border-orange-300 transition-colors"
                 >
                    <Package size={20}/> Vorläufig speichern (Gepackt)
                 </button>

                 <button 
                    onClick={finishHandover}
                    disabled={!hasSignature}
                    className={`px-6 py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                        hasSignature 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg transform hover:-translate-y-1' 
                        : 'bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                    }`}
                 >
                    {hasSignature ? <CheckSquare size={20}/> : <PenTool size={20}/>} 
                    Ausgabe abschließen
                 </button>
            </div>
        </div>
      </div>
    );
  }

  // 3. Return View (Rücknahme)
  if (view === 'return' && selectedBooking) {
      const plan = getPlan(selectedBooking.planId);
      if (!plan) return <div>Plan not found</div>;
      const sortedBookingItems = sortBookingItems(selectedBooking.items);

      return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg animate-fade-in transition-colors duration-200">
          <button onClick={() => { setSelectedBooking(null); setView('dashboard'); }} className="mb-4 text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"><ArrowLeft size={16}/> Zurück zum Dashboard</button>
          
          <div className="flex justify-between items-center mb-6 border-b dark:border-slate-700 pb-4">
              <div>
                <h2 className="text-2xl font-bold dark:text-white">Rückgabe</h2>
                <p className="text-gray-600 dark:text-gray-400">Gruppe {plan.groupLetter} | {plan.className}</p>
              </div>
              <button onClick={() => checkAllReturned(selectedBooking)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Alle als zurückgekehrt markieren</button>
          </div>

          <div className="space-y-4">
              {sortedBookingItems
                .filter(item => item.handedOutCount > 0)
                .map((bItem) => {
                  const invItem = inventory.find(i => i.id === bItem.itemId);
                  const isReturned = bItem.returnedCount >= bItem.handedOutCount;
                  const hasDefectNote = invItem?.maintenanceNotes && invItem.maintenanceNotes.length > 0;

                  return (
                      <div key={bItem.itemId} className={`p-4 border rounded-lg transition-colors ${isReturned ? 'bg-gray-50 dark:bg-slate-900/50 opacity-75' : 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900 shadow-sm'}`}>
                          <div className="flex flex-col md:flex-row md:items-center gap-4">
                              {/* Left: Info & Status */}
                              <div className="flex-1 flex items-center gap-4">
                                  <div className="font-bold text-xl dark:text-white bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded">{bItem.handedOutCount}x</div>
                                  <div>
                                      <h4 className="font-bold dark:text-white">{invItem?.name}</h4>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">{invItem?.category}</span>
                                  </div>
                              </div>

                              {/* Middle: Actions */}
                              <div className="flex items-center gap-4">
                                  <button 
                                      onClick={() => handleReturnUpdate(selectedBooking, bItem.itemId, !isReturned)}
                                      className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-colors border ${
                                          isReturned 
                                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200' 
                                          : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 border-gray-300'
                                      }`}
                                  >
                                      {isReturned ? <Check size={18} /> : <ArrowDownCircle size={18} />}
                                      {isReturned ? 'Im Lager' : 'Zurückbuchen'}
                                  </button>
                              </div>
                          </div>
                          
                          {/* Bottom: Defect Note attached to Inventory Item */}
                          <div className="mt-3 pt-3 border-t dark:border-slate-700">
                             <label className={`text-xs font-bold uppercase flex items-center gap-1 mb-1 ${hasDefectNote ? 'text-red-600' : 'text-gray-500'}`}>
                                 <AlertTriangle size={12}/> Defekt / Anmerkung (Dauerhaft)
                             </label>
                             <input 
                                type="text" 
                                className={`w-full text-sm p-2 rounded border ${hasDefectNote ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 text-red-800 dark:text-red-200' : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white'}`}
                                placeholder="Keine Mängel"
                                value={invItem?.maintenanceNotes || ''}
                                onChange={(e) => handleMaintenanceNote(bItem.itemId, e.target.value)}
                             />
                          </div>
                      </div>
                  );
              })}
              {/* Fallback if nothing was handed out */}
              {sortedBookingItems.filter(item => item.handedOutCount > 0).length === 0 && (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                      Es wurden keine Geräte als "Ausgegeben" markiert.
                  </div>
              )}
          </div>
          <div className="mt-8 flex justify-end">
              <button onClick={() => setView('dashboard')} className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-700">Rückgabe verlassen</button>
          </div>
        </div>
      );
  }

  // 5. Default Dashboard View
  return (
    <div className="space-y-6">
      {/* Navbar for sub-views */}
      <div className="flex gap-4 border-b dark:border-slate-700 pb-4 overflow-x-auto">
        <button 
            onClick={() => setView('dashboard')} 
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${view === 'dashboard' ? 'bg-slate-800 dark:bg-slate-700 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
        >
            Übersicht (Dashboard)
        </button>
        <button 
            onClick={() => setView('inventory')} 
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${view === 'inventory' ? 'bg-slate-800 dark:bg-slate-700 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
        >
            Inventar verwalten
        </button>
      </div>

      {view === 'dashboard' && (
        <>
          {/* Filter Bar */}
          <div className="flex items-center gap-2 mb-4 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm">
             <Filter size={18} className="text-gray-500 dark:text-gray-400"/>
             <span className="text-sm font-medium dark:text-gray-300">Filter Klasse:</span>
             <select 
                value={filterClass} 
                onChange={(e) => setFilterClass(e.target.value)} 
                className="border rounded px-2 py-1 text-sm bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
                <option value="all">Alle Klassen</option>
                {Object.values(ClassName).map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredBookings.length === 0 ? (
                 <div className="col-span-full text-center py-10 text-gray-400">Keine aktiven Projekte gefunden.</div>
             ) : (
                 filteredBookings.map(booking => {
                     const plan = getPlan(booking.planId);
                     if (!plan) return null;
                     
                     const isComplete = booking.status === 'returned';
                     const isPacked = booking.status === 'packed';
                     const isActive = booking.status === 'active';
                     const isPending = booking.status === 'pending';
                     
                     // Determine status visualization to match buttons
                     let statusColor = 'bg-gray-400';
                     let statusText = 'Zurückgegeben';
                     let statusTextColor = 'text-gray-500 dark:text-gray-400';

                     if (isPending) {
                        statusColor = 'bg-orange-500';
                        statusText = 'Noch Packen';
                        statusTextColor = 'text-orange-600 dark:text-orange-400';
                     } else if (isPacked) {
                        statusColor = 'bg-yellow-500';
                        statusText = 'Gepackt';
                        statusTextColor = 'text-yellow-600 dark:text-yellow-400';
                     } else if (isActive) {
                        statusColor = 'bg-green-500';
                        statusText = 'Ausgegeben';
                        statusTextColor = 'text-green-600 dark:text-green-400';
                     }

                     return (
                         <div key={booking.id} className={cardClass}>
                            {/* Visual Indicator for Completion */}
                            {isComplete && (
                                <div className="absolute top-2 right-2 z-10">
                                    <div className="bg-white dark:bg-slate-800 rounded-full p-1 shadow">
                                        <CheckCircle className="text-green-500 fill-green-100 dark:fill-green-900" size={24} />
                                    </div>
                                </div>
                            )}

                            <div className="bg-slate-50 dark:bg-slate-700 p-4 border-b dark:border-slate-600 flex justify-between items-start">
                                <div>
                                    <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-bold rounded mb-1">{plan.className}</span>
                                    <h3 className="font-bold text-lg dark:text-white">Gruppe {plan.groupLetter}</h3>
                                    {plan.projectTopic && <p className="text-sm font-medium text-slate-700 dark:text-slate-200 italic mb-1">"{plan.projectTopic}"</p>}
                                    <p className="text-sm text-gray-500 dark:text-gray-300">{plan.projectType}</p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <span className={`inline-block w-3 h-3 rounded-full ${statusColor}`}></span>
                                    <span className={`text-[10px] font-bold uppercase ${statusTextColor}`}>{statusText}</span>
                                </div>
                            </div>
                            
                            <div className="p-4 space-y-3 text-sm">
                                {/* 1. Buchung vom */}
                                <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                                    <Clock size={16} className="mt-0.5 shrink-0"/>
                                    <div>
                                        <p className="font-bold text-xs uppercase text-gray-500 dark:text-gray-400">Buchung vom:</p>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {(plan as any).updatedAt 
                                                ? `${new Date((plan as any).updatedAt).toLocaleDateString('de-DE')}`
                                                : `${new Date(plan.createdAt).toLocaleDateString('de-DE')}`
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* 2. Erster Drehtag */}
                                <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                                    <MapPin size={16} className="mt-0.5 shrink-0"/>
                                    <div>
                                        <p className="font-bold text-xs uppercase text-gray-500 dark:text-gray-400">Erster Drehtag:</p>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {plan.locations.length > 0 && plan.locations[0].date 
                                                ? new Date(plan.locations[0].date).toLocaleDateString('de-DE') 
                                                : '-'}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* 3. Zwischenlagerung */}
                                {(plan.storageDates || []).length > 0 && (
                                    <div className="flex items-start gap-2 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-100 dark:border-orange-800">
                                        <Package size={16} className="mt-0.5 shrink-0"/>
                                        <div>
                                            <p className="font-bold text-xs uppercase">Zwischenlagerung:</p>
                                            <p className="font-medium">
                                                {(plan.storageDates || []).map(d => new Date(d).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit'})).join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* 4. Rückgabe */}
                                <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                                    <ArrowDownCircle size={16} className="mt-0.5 shrink-0"/>
                                    <div>
                                        <p className="font-bold text-xs uppercase text-gray-500 dark:text-gray-400">Rückgabe:</p>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {plan.returnDate ? new Date(plan.returnDate).toLocaleDateString('de-DE') : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-gray-50 dark:bg-slate-700/50 border-t dark:border-slate-600 grid grid-cols-4 gap-2">
                                <button 
                                    onClick={() => { setSelectedBooking(booking); setView('details'); }}
                                    className="col-span-2 bg-white dark:bg-slate-800 border border-fuchsia-500 dark:border-fuchsia-500 text-fuchsia-700 dark:text-white py-2 rounded text-sm font-medium hover:bg-fuchsia-50 dark:hover:bg-slate-700 flex justify-center items-center gap-1 transition-colors"
                                >
                                    <Clock size={16}/> Drehdaten
                                </button>
                                <button
                                    onClick={() => { setSelectedBooking(booking); setView('handover'); }}
                                    disabled={isComplete}
                                    className={`col-span-2 py-2 rounded text-sm font-medium flex justify-center items-center gap-1 transition-colors ${
                                        isComplete
                                            ? 'bg-gray-200 dark:bg-slate-600 text-gray-400 cursor-not-allowed'
                                            : isActive
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : isPacked
                                                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                                    : 'bg-orange-500 text-white hover:bg-orange-600'
                                    }`}
                                >
                                    {isActive || isComplete ? <CheckSquare size={16}/> : (isPacked ? <Package size={16}/> : <AlertCircle size={16}/>)}
                                    Technik
                                </button>
                                
                                {(booking.status === 'active' || booking.status === 'returned' || booking.status === 'packed') && (
                                    <>
                                        <button 
                                            onClick={() => { setSelectedBooking(booking); setView('return'); }}
                                            disabled={isComplete || isPacked}
                                            className={`col-span-2 py-2 rounded text-sm font-medium flex justify-center items-center gap-1 transition-colors ${isComplete || isPacked ? 'bg-gray-200 dark:bg-slate-600 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                        >
                                            <ArrowDownCircle size={16}/> Rückgabe
                                        </button>
                                        <button 
                                            onClick={() => handleOpenPrintWindow(booking)}
                                            className="col-span-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-200 py-2 rounded text-sm font-medium hover:bg-gray-300 dark:hover:bg-slate-500 flex justify-center items-center gap-1 transition-colors"
                                            title="Lieferschein PDF / Drucken"
                                        >
                                            <Printer size={16}/> Packliste
                                        </button>
                                    </>
                                )}
                                
                                <button 
                                    onClick={() => setBookingToDelete(booking)}
                                    className="col-span-4 mt-1 py-1 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex justify-center items-center gap-1"
                                >
                                    <Trash2 size={12}/> Projekt Löschen
                                </button>
                            </div>
                         </div>
                     );
                 })
             )}
          </div>
        </>
      )}

      {view === 'inventory' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 transition-colors duration-200">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white"><Box /> Inventar Verwaltung</h2>
            
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg mb-8 border dark:border-slate-600">
                <h3 className="font-bold text-sm uppercase text-slate-500 dark:text-slate-400 mb-3">Neues Gerät hinzufügen</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs mb-1 dark:text-gray-300">Kategorie</label>
                        {isNewItemCustomCat ? (
                            <div className="flex gap-1">
                                <input 
                                    type="text" 
                                    className={inputClass}
                                    value={newItem.category}
                                    placeholder="Neue Kategorie"
                                    onChange={e => setNewItem({...newItem, category: e.target.value})}
                                    autoFocus
                                />
                                <button onClick={() => { setIsNewItemCustomCat(false); setNewItem({...newItem, category: uniqueCategories[0]}); }} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><X size={16}/></button>
                            </div>
                        ) : (
                            <select 
                                className={inputClass}
                                value={newItem.category}
                                onChange={e => {
                                    if(e.target.value === 'NEW_CAT_OPTION') setIsNewItemCustomCat(true);
                                    else setNewItem({...newItem, category: e.target.value});
                                }}
                            >
                                {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                <option value="NEW_CAT_OPTION" className="font-bold text-blue-600">+ Neue Kategorie...</option>
                            </select>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs mb-1 dark:text-gray-300">Bezeichnung</label>
                        <input 
                            type="text" 
                            className={inputClass}
                            value={newItem.name}
                            onChange={e => setNewItem({...newItem, name: e.target.value})}
                            placeholder="z.B. Sony A7S III"
                        />
                    </div>
                    <div>
                         <label className="block text-xs mb-1 dark:text-gray-300">Anzahl</label>
                         <input 
                            type="number" 
                            className={inputClass}
                            value={newItem.totalStock}
                            onChange={e => setNewItem({...newItem, totalStock: parseInt(e.target.value)})}
                        />
                    </div>
                </div>
                <div className="mt-3">
                     <label className="block text-xs mb-1 dark:text-gray-300">Link (Optional)</label>
                     <input 
                        type="text" 
                        className={inputClass}
                        value={newItem.link || ''}
                        onChange={e => setNewItem({...newItem, link: e.target.value})}
                        placeholder="https://..."
                    />
                </div>
                <button 
                    onClick={handleAddItem}
                    className="mt-4 bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 flex items-center gap-2"
                >
                    <Plus size={16} /> Hinzufügen
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 dark:bg-slate-700 border-b dark:border-slate-600">
                        <tr>
                            <th className="p-3 dark:text-white">Kategorie</th>
                            <th className="p-3 dark:text-white">Gerät</th>
                            <th className="p-3 text-center dark:text-white">Gesamtbestand</th>
                            <th className="p-3 text-center dark:text-white">Verfügbar</th>
                            <th className="p-3 dark:text-white">Anmerkungen (Dauerhaft)</th>
                            <th className="p-3 text-right dark:text-white">Aktion</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-700">
                        {inventory.map(item => (
                            <tr key={item.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="p-3 text-gray-500 dark:text-gray-400">{item.category}</td>
                                <td className="p-3 font-medium dark:text-gray-200">{item.name}</td>
                                <td className="p-3 text-center font-bold dark:text-white">{item.totalStock}</td>
                                <td className="p-3 text-center text-blue-600 dark:text-blue-400">
                                    {getAvailableCount(item.id)} 
                                </td>
                                <td className="p-3">
                                    {item.maintenanceNotes && (
                                        <span className="text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded text-xs border border-red-200 dark:border-red-800">
                                            {item.maintenanceNotes}
                                        </span>
                                    )}
                                </td>
                                <td className="p-3 text-right">
                                    <button 
                                        onClick={() => setEditingItem(item)}
                                        className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 p-1"
                                        title="Bearbeiten"
                                    >
                                        <Edit size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg p-6 relative transition-colors duration-200 animate-in fade-in zoom-in-95">
                <button 
                  onClick={() => { setEditingItem(null); setIsEditingCustomCat(false); }}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>
                <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2"><Edit size={20}/> Item Bearbeiten</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs mb-1 dark:text-gray-300">Kategorie</label>
                         {isEditingCustomCat ? (
                            <div className="flex gap-1">
                                <input 
                                    type="text" 
                                    className={inputClass}
                                    value={editingItem.category}
                                    placeholder="Neue Kategorie"
                                    onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                                    autoFocus
                                />
                                <button onClick={() => { setIsEditingCustomCat(false); setEditingItem({...editingItem, category: uniqueCategories[0]}); }} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><X size={16}/></button>
                            </div>
                        ) : (
                            <select 
                                className={inputClass}
                                value={editingItem.category}
                                onChange={e => {
                                    if(e.target.value === 'NEW_CAT_OPTION') setIsEditingCustomCat(true);
                                    else setEditingItem({...editingItem, category: e.target.value});
                                }}
                            >
                                {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                <option value="NEW_CAT_OPTION" className="font-bold text-blue-600">+ Neue Kategorie...</option>
                            </select>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs mb-1 dark:text-gray-300">Bezeichnung</label>
                        <input 
                            type="text" 
                            className={inputClass}
                            value={editingItem.name}
                            onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs mb-1 dark:text-gray-300">Gesamtbestand</label>
                             <input 
                                type="number" 
                                className={inputClass}
                                value={editingItem.totalStock}
                                onChange={e => setEditingItem({...editingItem, totalStock: parseInt(e.target.value)})}
                            />
                        </div>
                    </div>

                     <div>
                         <label className="block text-xs mb-1 dark:text-gray-300">Link</label>
                         <input 
                            type="text" 
                            className={inputClass}
                            value={editingItem.link || ''}
                            onChange={e => setEditingItem({...editingItem, link: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-xs mb-1 dark:text-gray-300">Dauerhafte Anmerkung (Defekt etc.)</label>
                         <input 
                            type="text" 
                            className={inputClass}
                            value={editingItem.maintenanceNotes || ''}
                            onChange={e => setEditingItem({...editingItem, maintenanceNotes: e.target.value})}
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button 
                        onClick={() => { setEditingItem(null); setIsEditingCustomCat(false); }}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
                    >
                        Abbrechen
                    </button>
                    <button 
                        onClick={handleUpdateItem}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                    >
                        Speichern
                    </button>
                </div>
            </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!bookingToDelete} 
        onClose={() => setBookingToDelete(null)} 
        onConfirm={confirmDelete} 
        title="Projekt unwiderruflich löschen?" 
        message={`Möchten Sie das Projekt "${bookingToDelete ? getPlan(bookingToDelete.planId)?.className : ''} - Gruppe ${bookingToDelete ? getPlan(bookingToDelete.planId)?.groupLetter : ''}" wirklich löschen?`} 
      />
    </div>
  );
};