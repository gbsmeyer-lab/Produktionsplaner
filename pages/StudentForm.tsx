
import React, { useState, useEffect } from 'react';
import { useApp } from '../services/store';
import { ClassName, ProjectType, GroupLetter, ShootPlan, GroupMember, ShootLocation, CustomItem } from '../types';
import { Plus, Trash2, Calendar, Clock, MapPin, User, Phone, Save, ShoppingCart, ExternalLink, Edit3, Type } from 'lucide-react';

interface StudentFormProps {
  triggerExample?: number;
}

export const StudentForm: React.FC<StudentFormProps> = ({ triggerExample }) => {
  const { inventory, createShootPlan, getAvailableCount } = useApp();
  const [step, setStep] = useState<1 | 2>(1);
  const [submitted, setSubmitted] = useState(false);

  // Plan State
  // We use a specific string 'CUSTOM' to denote the user wants to type manually
  const [classNameSelect, setClassNameSelect] = useState<string>(Object.values(ClassName)[0]);
  const [customClassName, setCustomClassName] = useState('');
  
  const [projectTypeSelect, setProjectTypeSelect] = useState<string>(Object.values(ProjectType)[0]);
  const [customProjectType, setCustomProjectType] = useState('');
  
  const [projectTopic, setProjectTopic] = useState('');

  const [groupLetter, setGroupLetter] = useState<GroupLetter>(GroupLetter.A);
  const [members, setMembers] = useState<GroupMember[]>([{ name: '', role: '' }]);
  const [locations, setLocations] = useState<ShootLocation[]>([{ address: '', date: '', timeStart: '', timeEnd: '' }]);
  const [contactPhone, setContactPhone] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [storageDates, setStorageDates] = useState<string[]>([]);
  const [tempStorageDate, setTempStorageDate] = useState('');

  // Booking State
  const [cart, setCart] = useState<{ [itemId: string]: number }>({});
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [activeTab, setActiveTab] = useState('Kamera & Rigging');

  // Helper to format date as YYYY-MM-DD
  const fmtDate = (daysToAdd: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (triggerExample && triggerExample > 0) {
      // 1. Fill Plan Data
      setClassNameSelect(ClassName.ME24B);
      setCustomClassName(''); // Reset custom
      
      setProjectTypeSelect(ProjectType.NONFICTION_LARGE);
      setCustomProjectType(''); // Reset custom
      setProjectTopic('Die verborgenen Ecken Hamburgs');

      setGroupLetter(GroupLetter.C);
      setMembers([
        { name: 'Max Mustermann', role: 'Kamera' },
        { name: 'Lisa Schmidt', role: 'Regie' },
        { name: 'Tom Müller', role: 'Ton' },
        { name: 'Sarah Klein', role: 'Produktion' }
      ]);
      setLocations([
        { address: 'Stadtpark, Pavillon', date: fmtDate(0), timeStart: '09:00', timeEnd: '12:00' },
        { address: 'Schule, Studio A', date: fmtDate(0), timeStart: '13:00', timeEnd: '16:00' },
        { address: 'Marktplatz 5, Innenstadt', date: fmtDate(1), timeStart: '10:00', timeEnd: '14:00' },
        { address: 'Hafenstraße 12', date: fmtDate(2), timeStart: '18:00', timeEnd: '22:00' },
        { address: 'Bahnhofsvorplatz', date: fmtDate(2), timeStart: '22:00', timeEnd: '23:30' }
      ]);
      setContactPhone('0176 12345678');
      setReturnDate(fmtDate(3));
      setStorageDates([fmtDate(1)]); // Storage on day 2
      
      // 2. Fill Cart (~10 Items)
      // IDs based on constants.ts
      const exampleCart = {
        'cam-1': 1,      // BM Pocket
        'lens-ef-2': 1,  // Canon 16-35
        'tripod-1': 1,   // Sachtler
        'mon-1': 1,      // Portkeys Monitor
        'batt-1': 4,     // NP-F570 Akkus
        'audio-rec-1': 1,// MixPre6
        'audio-mic-3': 1,// MKH416
        'light-rgb-2': 1,// Aputure MC Set
        'acc-2': 1,      // Gaffer Tape
        'acc-3': 1       // Kabeltrommel
      };
      setCart(exampleCart);

      setCustomItems([
          { name: 'Eigene Requisiten (Hut)', count: 2, notes: '' }
      ]);
      
      setSubmitted(false);
      setStep(1);
    }
  }, [triggerExample]);

  const addMember = () => {
    if (members.length < 5) setMembers([...members, { name: '', role: '' }]);
  };

  const addLocation = () => {
    if (locations.length < 8) setLocations([...locations, { address: '', date: '', timeStart: '', timeEnd: '' }]);
  };

  const addStorageDate = () => {
    if (tempStorageDate && !storageDates.includes(tempStorageDate)) {
      setStorageDates([...storageDates, tempStorageDate]);
      setTempStorageDate('');
    }
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    const current = cart[itemId] || 0;
    const available = getAvailableCount(itemId);
    const newValue = Math.max(0, current + delta);
    
    // Prevent booking more than available (considering current cart)
    if (delta > 0 && newValue > available) return; 

    setCart(prev => {
      const n = { ...prev, [itemId]: newValue };
      if (newValue === 0) delete n[itemId];
      return n;
    });
  };

  const handleAddCustomItem = () => {
    setCustomItems([...customItems, { name: '', count: 1, notes: '' }]);
  };

  const handleSubmit = () => {
    // Determine final strings for Class and Project
    const finalClassName = classNameSelect === 'CUSTOM' ? customClassName : classNameSelect;
    const finalProjectType = projectTypeSelect === 'CUSTOM' ? customProjectType : projectTypeSelect;

    if (!finalClassName || !finalProjectType) {
      alert("Bitte Klasse und Projektart angeben.");
      return;
    }

    // FIX: Auto-add the temp storage date if user forgot to click "+"
    let finalStorageDates = [...storageDates];
    if (tempStorageDate && !finalStorageDates.includes(tempStorageDate)) {
      finalStorageDates.push(tempStorageDate);
    }

    const plan: ShootPlan = {
      id: `pl-${Date.now()}`,
      className: finalClassName,
      projectType: finalProjectType,
      projectTopic: projectTopic, // Add topic
      groupLetter,
      members,
      locations,
      contactPhone,
      returnDate,
      storageDates: finalStorageDates,
      createdAt: Date.now()
    };

    const requestedItems = Object.entries(cart).map(([itemId, count]) => ({ itemId, count }));

    createShootPlan(plan, requestedItems, customItems);
    setSubmitted(true);
  };

  // Helper to open links
  const handleLinkClick = (url: string | undefined) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-8 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Save size={40} />
        </div>
        <h2 className="text-3xl font-bold mb-4 dark:text-white">Erfolgreich gespeichert!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">Eure Drehplanung und Technikbestellung wurde übermittelt. Bitte meldet euch beim Lehrer für die Ausgabe.</p>
        <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors">
          Neue Planung starten
        </button>
      </div>
    );
  }

  // Styles for inputs to support dark mode
  const inputClass = "w-full border rounded p-2 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-colors";
  
  // Logical grouping for the tabs
  const tabs = [
    { id: 'Kamera & Rigging', categories: ['Kamera', 'Drohne', 'Action-Cam', 'Rigging', 'Stativ', 'Gimbal', 'Follow Focus', 'Monitor', 'Slider', 'Greenscreen'] },
    { id: 'Objektive', categories: ['Objektiv'] },
    { id: 'Licht', categories: ['Licht'] },
    { id: 'Audio', categories: ['Audio', 'Mixer', 'Kopfhörer'] },
    { id: 'Strom & Sonstiges', categories: ['Akku', 'Zubehör'] },
  ];

  return (
    <div className="max-w-5xl mx-auto bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden transition-colors duration-200">
      {/* Header Steps */}
      <div className="flex border-b dark:border-slate-700">
        <button 
          className={`flex-1 py-4 text-center font-semibold transition-colors ${step === 1 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-slate-400'}`}
          onClick={() => setStep(1)}
        >
          1. Drehplanung
        </button>
        <button 
          className={`flex-1 py-4 text-center font-semibold transition-colors ${step === 2 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-slate-400'}`}
          onClick={() => setStep(2)}
        >
          2. Technikbuchung
        </button>
      </div>

      <div className="p-6">
        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Klasse</label>
                <select 
                  value={classNameSelect} 
                  onChange={e => setClassNameSelect(e.target.value)} 
                  className={inputClass}
                >
                  {Object.values(ClassName).map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="CUSTOM">Eigene Eingabe...</option>
                </select>
                {classNameSelect === 'CUSTOM' && (
                  <div className="mt-2 animate-fade-in">
                    <input 
                      type="text"
                      placeholder="Klasse eingeben"
                      value={customClassName}
                      onChange={e => setCustomClassName(e.target.value)}
                      className={`${inputClass} border-blue-400 dark:border-blue-500`}
                      autoFocus
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Projekt</label>
                <select 
                  value={projectTypeSelect} 
                  onChange={e => setProjectTypeSelect(e.target.value)} 
                  className={inputClass}
                >
                  {Object.values(ProjectType).map(p => <option key={p} value={p}>{p}</option>)}
                  <option value="CUSTOM">Eigene Eingabe...</option>
                </select>
                {projectTypeSelect === 'CUSTOM' && (
                  <div className="mt-2 animate-fade-in">
                    <input 
                      type="text"
                      placeholder="Projektart eingeben"
                      value={customProjectType}
                      onChange={e => setCustomProjectType(e.target.value)}
                      className={`${inputClass} border-blue-400 dark:border-blue-500`}
                      autoFocus
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gruppe</label>
                <select value={groupLetter} onChange={e => setGroupLetter(e.target.value as GroupLetter)} className={inputClass}>
                  {Object.values(GroupLetter).map(g => (
                    <option key={g} value={g}>
                      {g === GroupLetter.NONE ? 'Keine' : `Gruppe ${g}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Topic Field */}
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><Type size={16}/> Thema / Arbeitstitel</label>
               <input 
                 type="text" 
                 placeholder="z.B. Dokumentation über..." 
                 value={projectTopic}
                 onChange={e => setProjectTopic(e.target.value)}
                 className={inputClass}
               />
            </div>

            {/* Members */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 dark:text-white"><User size={20}/> Gruppenmitglieder</h3>
              <div className="space-y-2">
                {members.map((member, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input 
                      placeholder="Name" 
                      value={member.name}
                      onChange={e => {
                        const newM = [...members];
                        newM[idx].name = e.target.value;
                        setMembers(newM);
                      }}
                      className={`${inputClass} flex-1`}
                    />
                    <input 
                      placeholder="Funktion (z.B. Kamera)" 
                      value={member.role}
                      onChange={e => {
                        const newM = [...members];
                        newM[idx].role = e.target.value;
                        setMembers(newM);
                      }}
                      className={`${inputClass} flex-1`}
                    />
                    {members.length > 1 && (
                      <button onClick={() => setMembers(members.filter((_, i) => i !== idx))} className="text-red-500 dark:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                {members.length < 5 && (
                  <button onClick={addMember} className="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-1 mt-2 hover:underline">
                    <Plus size={16} /> Mitglied hinzufügen
                  </button>
                )}
              </div>
            </div>

            {/* Locations */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 dark:text-white"><MapPin size={20}/> Drehorte & Zeiten (Max 3 Tage)</h3>
              <div className="space-y-4">
                {locations.map((loc, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded border dark:border-slate-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                      <input 
                        placeholder="Adresse / Ort" 
                        value={loc.address}
                        onChange={e => {
                          const newL = [...locations];
                          newL[idx].address = e.target.value;
                          setLocations(newL);
                        }}
                        className={`${inputClass} col-span-2`}
                      />
                      <div className="flex items-center gap-2">
                         <Calendar size={16} className="text-gray-400 dark:text-gray-500"/>
                         <input type="date" value={loc.date} onChange={e => { const newL = [...locations]; newL[idx].date = e.target.value; setLocations(newL); }} className={inputClass}/>
                      </div>
                      <div className="flex gap-2">
                        <input type="time" value={loc.timeStart} onChange={e => { const newL = [...locations]; newL[idx].timeStart = e.target.value; setLocations(newL); }} className={inputClass}/>
                        <span className="self-center dark:text-gray-300">-</span>
                        <input type="time" value={loc.timeEnd} onChange={e => { const newL = [...locations]; newL[idx].timeEnd = e.target.value; setLocations(newL); }} className={inputClass}/>
                      </div>
                    </div>
                    {locations.length > 1 && (
                      <button onClick={() => setLocations(locations.filter((_, i) => i !== idx))} className="text-red-500 dark:text-red-400 text-xs flex items-center gap-1 hover:underline">
                        <Trash2 size={12} /> Ort entfernen
                      </button>
                    )}
                  </div>
                ))}
                {locations.length < 8 && (
                   <button onClick={addLocation} className="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-1 hover:underline">
                   <Plus size={16} /> Drehort hinzufügen
                 </button>
                )}
              </div>
            </div>

            {/* Logistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 dark:text-white"><Phone size={20}/> Kontakt</h3>
                <input 
                  type="tel" 
                  placeholder="Handynummer für Notfälle" 
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className={inputClass}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 dark:text-white"><Clock size={20}/> Zwischenlagerung & Rückgabe</h3>
                <div className="space-y-4">
                  {/* Swapped: Storage first */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Zwischenlagerung (Schule)</label>
                    <div className="flex gap-2 mb-2">
                      <input 
                        type="date" 
                        value={tempStorageDate}
                        onChange={e => setTempStorageDate(e.target.value)}
                        className={`${inputClass} flex-1`}
                        placeholder="Datum"
                      />
                      <button 
                        onClick={addStorageDate} 
                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800 border dark:border-blue-800 text-xs font-medium uppercase"
                      >
                        Hinzufügen
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[1.5rem]">
                      {storageDates.map((d, i) => (
                        <span key={i} className="bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 text-xs px-2 py-1 rounded flex items-center gap-1 border border-orange-200 dark:border-orange-800">
                          {new Date(d).toLocaleDateString('de-DE')} <button onClick={() => setStorageDates(storageDates.filter(sd => sd !== d))}><XIcon size={12}/></button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Swapped: Return second */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Endgültige Rückgabe</label>
                    <input 
                      type="date" 
                      value={returnDate}
                      onChange={e => setReturnDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button 
                onClick={() => setStep(2)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 transition-colors"
              >
                Weiter zur Technik <ShoppingCart size={20}/>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-xl font-bold dark:text-white">Technik auswählen</h2>
              <div className="text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-lg">
                Ausgewählt: <span className="font-bold">{Object.values(cart).reduce((a: number, b: number) => a + b, 0)}</span> Teile
              </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto pb-2 mb-6 gap-2 no-scrollbar">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900' 
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {tab.id}
                </button>
              ))}
            </div>

            {/* Compact Table Inventory List */}
            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-700/50 border-b dark:border-slate-700 text-gray-500 dark:text-gray-400">
                    <th className="p-3 font-medium w-1/2">Gerät / Bezeichnung</th>
                    <th className="p-3 font-medium hidden sm:table-cell">Kategorie</th>
                    <th className="p-3 font-medium text-center w-24">Verfügbar</th>
                    <th className="p-3 font-medium text-right w-32">Auswahl</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-700">
                  {inventory
                    .filter(item => {
                       const currentTab = tabs.find(t => t.id === activeTab);
                       return currentTab?.categories.some(cat => item.category.includes(cat));
                    })
                    .map(item => {
                      const available = getAvailableCount(item.id);
                      const inCart = cart[item.id] || 0;
                      
                      return (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${available === 0 ? 'text-gray-400 dark:text-gray-500' : 'text-slate-900 dark:text-slate-200'}`}>
                                {item.name}
                              </span>
                              {item.link && (
                                <button 
                                  onClick={() => handleLinkClick(item.link)}
                                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                  title="Link öffnen"
                                >
                                  <ExternalLink size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{item.category}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              available > 0 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            }`}>
                              {available}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-2">
                              {inCart > 0 && <span className="font-bold text-slate-900 dark:text-white mr-2">{inCart}</span>}
                              <button 
                                onClick={() => handleQuantityChange(item.id, -1)}
                                disabled={inCart === 0}
                                className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300 disabled:opacity-30 transition-colors"
                              >
                                -
                              </button>
                              <button 
                                onClick={() => handleQuantityChange(item.id, 1)}
                                disabled={available <= 0}
                                className="w-7 h-7 flex items-center justify-center rounded bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 disabled:opacity-30 transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {/* Fallback if no items in tab */}
              {inventory.filter(item => {
                  const currentTab = tabs.find(t => t.id === activeTab);
                  return currentTab?.categories.some(cat => item.category.includes(cat));
              }).length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  Keine Geräte in dieser Kategorie gefunden.
                </div>
              )}
            </div>

            {/* Custom Items */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800/50 mt-8">
              <h3 className="font-bold text-yellow-800 dark:text-yellow-500 mb-4">Zusätzliches / Sonstiges</h3>
              <div className="space-y-4">
                {customItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="flex-1">
                       <input 
                         placeholder="Gegenstand" 
                         value={item.name} 
                         onChange={e => {
                           const n = [...customItems]; n[idx].name = e.target.value; setCustomItems(n);
                         }} 
                         className="w-full border rounded p-2 text-sm bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                       />
                    </div>
                    <div className="w-20">
                       <input 
                         type="number" 
                         placeholder="Anz" 
                         value={item.count} 
                         onChange={e => {
                           const n = [...customItems]; n[idx].count = parseInt(e.target.value) || 1; setCustomItems(n);
                         }} 
                         className="w-full border rounded p-2 text-sm bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                       />
                    </div>
                    <button onClick={() => setCustomItems(customItems.filter((_, i) => i !== idx))} className="text-red-500 dark:text-red-400 mt-2 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button onClick={handleAddCustomItem} className="text-sm font-medium text-yellow-800 dark:text-yellow-500 flex items-center gap-1 hover:underline">
                  <Plus size={16} /> Weiteres Feld hinzufügen
                </button>
              </div>
            </div>

            <div className="flex justify-between pt-8 border-t dark:border-slate-700 mt-8">
              <button 
                onClick={() => setStep(1)}
                className="text-gray-600 dark:text-gray-300 font-medium px-6 py-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
              >
                Zurück
              </button>
              <button 
                onClick={handleSubmit}
                disabled={Object.keys(cart).length === 0 && customItems.length === 0}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Planung Abschließen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper for X icon
const XIcon = ({size}: {size: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
