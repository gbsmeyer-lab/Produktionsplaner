
import { InventoryItem } from './types';

// Helper to generate a search link since specific URLs weren't in the raw text
const searchLink = (query: string) => `https://www.google.com/search?q=${encodeURIComponent(query)}`;

export const INITIAL_INVENTORY: InventoryItem[] = [
  // --- KAMERA ---
  { id: 'cam-1', category: 'Kamera', name: 'Blackmagic Pocket 6k Pro, 512 GB CFAST2.0', totalStock: 5, link: searchLink('Blackmagic Pocket 6k Pro') },
  { id: 'cam-2', category: 'Kamera', name: 'Blackmagic Ursa Mini Pro G2 4,6k, 512 GB+256 GB CFAST2.0', totalStock: 1, link: searchLink('Blackmagic Ursa Mini Pro G2') },
  { id: 'cam-3', category: 'Kamera', name: 'Blackmagic Ursa Broadcast G2 + Fujinon La16x8BRM (B4)', totalStock: 2, link: searchLink('Blackmagic Ursa Broadcast G2') },
  { id: 'cam-4', category: 'Kamera', name: 'Sony ZV-E1 inkl. 3 Akkus NP-FZ100, 256 GB-SD', totalStock: 6, link: searchLink('Sony ZV-E1') },
  { id: 'drone-1', category: 'Kamera-Drohne', name: 'DJI-Mavic Mini 3 Pro, 128GB Micro-SD', totalStock: 3, link: searchLink('DJI Mavic Mini 3 Pro') },
  { id: 'action-1', category: 'Action-Cam', name: 'GoPro Hero 6', totalStock: 1, link: searchLink('GoPro Hero 6') },
  
  // --- RIGGING & SUPPORT ---
  { id: 'rig-1', category: 'Rigging', name: 'Cage für Blackmagic Pocket 6k Pro', totalStock: 4, link: searchLink('SmallRig Cage Blackmagic Pocket 6k Pro') },
  { id: 'rig-2', category: 'Rigging', name: 'Easy Rig', totalStock: 2, link: searchLink('Easy Rig') },
  { id: 'tripod-1', category: 'Kamerastativ', name: 'Sachtler', totalStock: 9, link: searchLink('Sachtler Stativ') },
  { id: 'gimbal-1', category: 'Gimbal', name: 'DJI Ronin III', totalStock: 3, link: searchLink('DJI Ronin 3') },
  { id: 'follow-1', category: 'Follow Focus', name: 'DJI Focus Pro All-In-One Combo', totalStock: 3, link: searchLink('DJI Focus Pro') },
  { id: 'slider-1', category: 'Kamera Slider', name: 'unmotorisiert', totalStock: 1, link: searchLink('Kamera Slider') },
  { id: 'slider-2', category: 'Kamera Slider', name: 'Waterbird MS Pro 120 inkl. Fluid-Stativkopf', totalStock: 2, link: searchLink('Waterbird MS Pro 120') },
  { id: 'green-1', category: 'Greenscreen', name: 'Manfrotto, mobil, modular, 4x3m', totalStock: 2, link: searchLink('Manfrotto Greenscreen') },

  // --- OBJEKTIVE EF ---
  { id: 'lens-ef-1', category: 'Objektiv EF', name: 'Canon EF 24-105mm 1:4', totalStock: 4, link: searchLink('Canon EF 24-105mm') },
  { id: 'lens-ef-2', category: 'Objektiv EF', name: 'Canon EF 16-35mm F2,8L III USM', totalStock: 4, link: searchLink('Canon EF 16-35mm') },
  { id: 'lens-ef-3', category: 'Objektiv EF', name: 'Sigma 50-100mm F1,8 DC HSM', totalStock: 3, link: searchLink('Sigma 50-100mm') },
  { id: 'lens-ef-4', category: 'Objektiv EF', name: 'Sigma 24-70 F2.8 DG', totalStock: 4, link: searchLink('Sigma 24-70mm') },
  { id: 'lens-ef-5', category: 'Objektiv EF', name: 'Canon EF 100mm 1:2.8 L IS USM Macro', totalStock: 1, link: searchLink('Canon EF 100mm Macro') },
  { id: 'lens-ef-6', category: 'Objektiv EF', name: 'Canon EF-S 17-55mm 1:2.8 IS', totalStock: 1, link: searchLink('Canon EF-S 17-55mm') },
  { id: 'lens-ef-7', category: 'Objektiv EF', name: 'Canon CN-E18-80mm T4.4 L IS (Motor)', totalStock: 1, link: searchLink('Canon CN-E18-80mm') },
  { id: 'lens-ef-8', category: 'Objektiv EF', name: 'Tamron AF 18-200mm 1:3,5 Macro (APS-C)', totalStock: 1, link: searchLink('Tamron 18-200mm') },
  { id: 'lens-ef-9', category: 'Objektiv EF', name: 'Canon EF-S 18-55mm 1:3,5 IS', totalStock: 1, link: searchLink('Canon EF-S 18-55mm') },

  // --- OBJEKTIVE E ---
  { id: 'lens-e-1', category: 'Objektiv E', name: 'Sony 20mm F1.8', totalStock: 6, link: searchLink('Sony 20mm F1.8') },
  { id: 'lens-e-2', category: 'Objektiv E', name: 'Sony-Zeiss 55 F1.8', totalStock: 6, link: searchLink('Sony Zeiss 55mm') },
  { id: 'lens-e-3', category: 'Objektiv E', name: 'Sony 24-105mm F4', totalStock: 6, link: searchLink('Sony 24-105mm F4') },

  // --- MONITORING ---
  { id: 'mon-1', category: 'Monitor', name: 'Portkey PT5 II mit HotShoe-Mount (5")', totalStock: 5, link: searchLink('Portkeys PT5 II') },
  { id: 'mon-2', category: 'Monitor', name: 'Liliput A12 4K mit Stativ (12")', totalStock: 2, link: searchLink('Lilliput A12') },

  // --- LICHT ---
  { id: 'light-1', category: 'Licht LED-Set', name: '3xBiColorLED (Fläche, klein, mit Stativen)', totalStock: 1, link: searchLink('BiColor LED Panel') },
  { id: 'light-2', category: 'Licht LED-Set', name: '3xBiColorLED (Fläche, groß, mit Stativen)', totalStock: 5, link: searchLink('BiColor LED Panel Large') },
  { id: 'light-3', category: 'Licht LED', name: '2xBiColorLED (Spot) 55W, mit Stativen', totalStock: 3, link: searchLink('BiColor LED Spot') },
  { id: 'light-rgb-1', category: 'Licht LED RGB', name: 'Aputure Nova 300c Kit+Stativ', totalStock: 9, link: searchLink('Aputure Nova 300c') },
  { id: 'light-rgb-2', category: 'Licht LED RGB', name: 'Aputure MC 12 Light Set', totalStock: 24, link: searchLink('Aputure MC') },
  { id: 'light-rgb-3', category: 'Licht LED RGB', name: 'Astera Helios RGB Tubes (8 Tubes)', totalStock: 8, link: searchLink('Astera Helios Tube') },
  { id: 'light-rgb-4', category: 'Licht LED RGB', name: 'Astera Titan RGB Tubes', totalStock: 15, link: searchLink('Astera Titan Tube') },
  { id: 'light-acc-1', category: 'Licht Zubehör', name: 'Astera Transmitter Box', totalStock: 2, link: searchLink('Astera Transmitter Box') },
  { id: 'light-acc-2', category: 'Licht', name: 'Faltreflektor/Bounce weiß/gold', totalStock: 3, link: searchLink('Reflektor Gold Weiß') },
  { id: 'light-acc-3', category: 'Licht', name: 'Faltreflektor/Bounce weiß/silber', totalStock: 3, link: searchLink('Reflektor Silber Weiß') },

  // --- AUDIO ---
  { id: 'audio-w-1', category: 'Audio Funk', name: 'Sennheiser G3, Bodypacks, 1 Lavalier', totalStock: 5, link: searchLink('Sennheiser G3 ew100') },
  { id: 'audio-w-2', category: 'Audio Funk', name: 'DJI Mic (je 1 Rx, 2 Tx, 2 Lavaliers)', totalStock: 4, link: searchLink('DJI Mic') },
  { id: 'audio-w-3', category: 'Audio Funk', name: 'Røde Wireless Pro (je 1 RX, 2 TX, 2 Lavaliers)', totalStock: 3, link: searchLink('Rode Wireless Pro') },
  { id: 'audio-rec-1', category: 'Audio Recorder', name: 'Sounddevices MixPre6, 128 GB', totalStock: 3, link: searchLink('Sounddevices MixPre6') },
  { id: 'audio-rec-2', category: 'Audio Recorder', name: 'Sounddevices MixPre3, 128 GB', totalStock: 2, link: searchLink('Sounddevices MixPre3') },
  { id: 'audio-rec-3', category: 'Audio Recorder', name: 'Zoom F8N Pro', totalStock: 2, link: searchLink('Zoom F8n Pro') },
  { id: 'audio-mic-1', category: 'Audio Mikrofon', name: 'Sennheiser Me66, Angel, Windkorb, Deadcat', totalStock: 4, link: searchLink('Sennheiser ME66') },
  { id: 'audio-mic-2', category: 'Audio Mikrofon', name: 'Røde NTG5, Angel, Windkorb, Deadcat', totalStock: 5, link: searchLink('Rode NTG5') },
  { id: 'audio-mic-3', category: 'Audio Mikrofon', name: 'Sennheiser MKH416, Tonangel, Windkorb, Deadcat', totalStock: 4, link: searchLink('Sennheiser MKH416') },
  { id: 'audio-mix-1', category: 'Audio Mixer', name: 'Alpha-Mix (analog, 4 inputs, stereo out)', totalStock: 2, link: searchLink('Alpha Mix Audio') },
  { id: 'audio-hp-1', category: 'Audio Kopfhörer', name: 'Sennheiser HD25', totalStock: 5, link: searchLink('Sennheiser HD25') },

  // --- POWER & ZUBEHÖR ---
  { id: 'batt-1', category: 'Akku', name: 'NP-F570; 3350mAh', totalStock: 25, link: searchLink('NP-F570 Akku') },
  { id: 'batt-2', category: 'Akku', name: 'NP-F970 6600mAh', totalStock: 12, link: searchLink('NP-F970 Akku') },
  { id: 'batt-3', category: 'Akku', name: 'V-Mount, 95Wh', totalStock: 12, link: searchLink('V-Mount Akku 95Wh') },
  { id: 'batt-4', category: 'Akku', name: 'V-Mount, 143Wh', totalStock: 12, link: searchLink('V-Mount Akku 143Wh') },
  { id: 'batt-5', category: 'Akku', name: 'Set mit je 4x AA Akku + Ladegerät', totalStock: 5, link: searchLink('AA Akkus Ladegerät') },
  { id: 'acc-1', category: 'Zubehör', name: 'XLR cables (various lengths)', totalStock: 10, link: searchLink('XLR Kabel') },
  { id: 'acc-2', category: 'Zubehör', name: 'Gaffer Tape', totalStock: 5, link: searchLink('Gaffer Tape') },
  { id: 'acc-3', category: 'Zubehör', name: 'Cable drum (20m)', totalStock: 3, link: searchLink('Kabeltrommel 20m') },
  { id: 'acc-4', category: 'Zubehör', name: 'Cable drum (10m)', totalStock: 3, link: searchLink('Kabeltrommel 10m') },
  { id: 'acc-5', category: 'Zubehör', name: 'Molton 3x3m', totalStock: 3, link: searchLink('Bühnenmolton') },
];
