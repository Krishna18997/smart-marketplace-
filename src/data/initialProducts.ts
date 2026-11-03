import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  // Required 5 products from CSE Problem Statement Specification
  {
    id: 'P01',
    title: 'Laptop A',
    category: 'Laptops',
    price: 22000,
    age: 2,
    condition: 'Good',
    listingType: 'buy',
    originalPrice: 45000,
    description: '14-inch student laptop with Core i5 processor, 8GB RAM, and 512GB SSD. Minor chassis scuffs, clean display and healthy battery.',
    image: '/src/assets/images/marketplace_laptop_1793687146166.jpg',
    specifications: { Processor: 'Intel Core i5', RAM: '8 GB', Storage: '512 GB SSD', Display: '14" FHD' }
  },
  {
    id: 'P02',
    title: 'Laptop B',
    category: 'Laptops',
    price: 18000,
    age: 3,
    condition: 'Average',
    listingType: 'buy',
    originalPrice: 42000,
    description: '15.6-inch workhorse laptop, ideal for coding and coursework. Keyboard shows visible wear, battery retains 65% capacity.',
    image: '/src/assets/images/marketplace_laptop_1793687146166.jpg',
    specifications: { Processor: 'AMD Ryzen 5', RAM: '8 GB', Storage: '256 GB SSD + 1TB HDD', Display: '15.6" FHD' }
  },
  {
    id: 'P03',
    title: 'Laptop C',
    category: 'Laptops',
    price: 25000,
    age: 1,
    condition: 'Excellent',
    listingType: 'buy',
    originalPrice: 48000,
    description: 'Nearly brand new ultrabook used for one semester only. Pristine condition with original charger and warranty documentation.',
    image: '/src/assets/images/marketplace_laptop_1793687146166.jpg',
    specifications: { Processor: 'Intel Core i5 12th Gen', RAM: '16 GB', Storage: '512 GB NVMe', Display: '14" IPS 100% sRGB' }
  },
  {
    id: 'P04',
    title: 'Laptop D',
    category: 'Laptops',
    price: 20000,
    age: 2,
    condition: 'Good',
    listingType: 'buy',
    originalPrice: 40000,
    description: 'Reliable student coding machine, upgraded with dual-channel RAM. Light wear around trackpad, otherwise fully functional.',
    image: '/src/assets/images/marketplace_laptop_1793687146166.jpg',
    specifications: { Processor: 'Intel Core i5 11th Gen', RAM: '16 GB', Storage: '512 GB SSD', Display: '14" Anti-glare' }
  },
  {
    id: 'P05',
    title: 'Laptop E',
    category: 'Laptops',
    price: 15000,
    age: 4,
    condition: 'Average',
    listingType: 'buy',
    originalPrice: 38000,
    description: 'Budget-friendly second-hand laptop suitable for Linux installations, web browsing, and basic programming assignments.',
    image: '/src/assets/images/marketplace_laptop_1793687146166.jpg',
    specifications: { Processor: 'Intel Core i3', RAM: '8 GB', Storage: '256 GB SSD', Display: '14" HD' }
  },

  // Additional Realistic Listings for Campus Student Marketplace
  {
    id: 'P06',
    title: 'ThinkPad T480 Ultrabook',
    category: 'Laptops',
    price: 19500,
    age: 3,
    condition: 'Good',
    listingType: 'buy',
    originalPrice: 58000,
    description: 'Legendary keyboard and dual hot-swappable batteries. Built like a tank, loved by computer science seniors.',
    image: '/src/assets/images/marketplace_laptop_1793687146166.jpg',
    specifications: { Processor: 'Intel Core i5-8350U', RAM: '16 GB', Storage: '512 GB SSD', OS: 'Ubuntu 24.04 LTS' }
  },
  {
    id: 'P07',
    title: 'Netbook Mini 11.6"',
    category: 'Laptops',
    price: 4500,
    age: 5,
    condition: 'Poor',
    listingType: 'buy',
    originalPrice: 24000,
    description: 'Very old lightweight netbook. Battery is dead so it must remain plugged into the AC adapter. Suitable as headless server.',
    image: '/src/assets/images/marketplace_laptop_1793687146166.jpg',
    specifications: { Processor: 'Intel Celeron', RAM: '4 GB', Storage: '128 GB eMMC' }
  },

  // Rental Listings (Rentals for Campus Students)
  {
    id: 'R01',
    title: 'Dell Latitude Core i7 (Semester Rental)',
    category: 'Laptops',
    price: 1200,
    age: 2,
    condition: 'Good',
    listingType: 'rent',
    rentDuration: '/month',
    originalPrice: 48000,
    description: 'Flexible monthly or semester rental for students needing a machine for lab projects or semester exams without upfront purchase.',
    image: '/src/assets/images/marketplace_laptop_1793687146166.jpg',
    specifications: { Processor: 'Intel Core i7', RAM: '16 GB', Deposit: '₹3,000 Refundable', Plan: '₹1,200/mo' }
  },
  {
    id: 'R02',
    title: 'Avon Campus Geared Cycle (Monthly Rental)',
    category: 'Bicycles',
    price: 450,
    age: 1,
    condition: 'Good',
    listingType: 'rent',
    rentDuration: '/month',
    originalPrice: 7500,
    description: 'Rent a campus bicycle on a monthly basis. Free basic maintenance included by student cycling club.',
    image: '/src/assets/images/marketplace_bicycle_1793687146978.jpg',
    specifications: { Plan: 'Monthly Rental', Maintenance: 'Included' }
  },

  // Books
  {
    id: 'B01',
    title: 'Introduction to Algorithms (CLRS) 3rd Ed',
    category: 'Books',
    price: 750,
    age: 1,
    condition: 'Excellent',
    originalPrice: 1600,
    description: 'The MIT Press bible for algorithms. Clean pages, no highlighting, tight binding. Perfect for competitive programming.',
    image: '/src/assets/images/marketplace_textbooks_1793687147552.jpg',
    specifications: { Authors: 'Cormen, Leiserson, Rivest, Stein', Edition: '3rd Edition', Pages: '1292' }
  },
  {
    id: 'B02',
    title: 'Computer Networks (Tanenbaum & Wetherall)',
    category: 'Books',
    price: 480,
    age: 2,
    condition: 'Good',
    originalPrice: 1100,
    description: 'Standard textbook for Computer Networks course. Light pencil marks on chapter 3 and 4, all diagrams intact.',
    image: '/src/assets/images/marketplace_textbooks_1793687147552.jpg',
    specifications: { Edition: '5th Pearson International', Language: 'English' }
  },
  {
    id: 'B03',
    title: 'Database System Concepts (Silberschatz)',
    category: 'Books',
    price: 550,
    age: 2,
    condition: 'Good',
    originalPrice: 1250,
    description: 'Essential database engineering reference covering SQL, ACID transactions, and indexing schemes.',
    image: '/src/assets/images/marketplace_textbooks_1793687147552.jpg',
    specifications: { Edition: '6th Edition', Subject: 'DBMS' }
  },
  {
    id: 'B04',
    title: 'Operating System Concepts (Dinosaur Book)',
    category: 'Books',
    price: 420,
    age: 3,
    condition: 'Average',
    originalPrice: 1150,
    description: 'Comprehensive OS concepts book. Corner creasing on cover, but pages are clean and legible.',
    image: '/src/assets/images/marketplace_textbooks_1793687147552.jpg',
    specifications: { Edition: '9th Wiley Edition' }
  },
  {
    id: 'B05',
    title: 'Rare Antique Engineering Mathematical Folio',
    category: 'Books',
    price: 2800,
    age: 4,
    condition: 'Good',
    originalPrice: 3500,
    description: 'Collector edition vintage hardcover mathematical tables and computational principles. Tests price anomaly within books category.',
    image: '/src/assets/images/marketplace_textbooks_1793687147552.jpg',
    specifications: { Type: 'Hardbound Folio', Year: '1988 Reference' }
  },
  {
    id: 'B06',
    title: 'Discrete Mathematics and Its Applications (Rosen)',
    category: 'Books',
    price: 520,
    age: 1,
    condition: 'Excellent',
    originalPrice: 1350,
    description: 'Foundational math book for algorithms and automata theory. No tears or markings.',
    image: '/src/assets/images/marketplace_textbooks_1793687147552.jpg',
    specifications: { Edition: '7th Global Edition' }
  },

  // Bicycles
  {
    id: 'C01',
    title: 'Hero Sprint Pro City Commuter',
    category: 'Bicycles',
    price: 4200,
    age: 2,
    condition: 'Good',
    originalPrice: 8500,
    description: 'Sturdy single-speed city bicycle for dorm to lecture hall transit. Recent brake pad replacement, includes front basket.',
    image: '/src/assets/images/marketplace_bicycle_1793687146978.jpg',
    specifications: { Frame: 'Steel 18"', Wheels: '26 Inch', Gears: 'Single Speed' }
  },
  {
    id: 'C02',
    title: 'Firefox Target 21-Speed Hybrid Bicycle',
    category: 'Bicycles',
    price: 7800,
    age: 1,
    condition: 'Excellent',
    originalPrice: 16000,
    description: 'Alloy frame hybrid bike with Shimano Tourney 21 gears and front suspension. Well lubricated, kept indoors.',
    image: '/src/assets/images/marketplace_bicycle_1793687146978.jpg',
    specifications: { Frame: 'Alloy 6061', Gears: '21 Speed Shimano', Brakes: 'Dual Disc' }
  },
  {
    id: 'C03',
    title: 'Hercules Roadeo Hardtail MTB',
    category: 'Bicycles',
    price: 3600,
    age: 3,
    condition: 'Average',
    originalPrice: 9000,
    description: 'Durable campus bike with wide trail tires. Minor rust on handlebar stem, rear tire has fresh inner tube.',
    image: '/src/assets/images/marketplace_bicycle_1793687146978.jpg',
    specifications: { Frame: 'Steel', Wheels: '26x2.10 MTB', Brakes: 'V-Brakes' }
  },
  {
    id: 'C04',
    title: 'Vintage Campus Cruiser Single-Speed',
    category: 'Bicycles',
    price: 2900,
    age: 4,
    condition: 'Average',
    originalPrice: 6500,
    description: 'Classic campus roadster. Fitted with bell and kickstand. Reliable everyday commuter.',
    image: '/src/assets/images/marketplace_bicycle_1793687146978.jpg',
    specifications: { Style: 'Dutch Roadster', Accessories: 'Bell + Kickstand' }
  },
  {
    id: 'C05',
    title: 'Carbon Aero Road Racing Bike',
    category: 'Bicycles',
    price: 28000,
    age: 2,
    condition: 'Excellent',
    originalPrice: 55000,
    description: 'High-end triathlon carbon racer brought by graduate student. Significantly deviates from campus average bicycle pricing.',
    image: '/src/assets/images/marketplace_bicycle_1793687146978.jpg',
    specifications: { Frame: 'Full Carbon T700', Groupset: 'Shimano 105', Weight: '8.4 kg' }
  },

  // Gadgets
  {
    id: 'G01',
    title: 'Sony WH-1000XM4 ANC Headphones',
    category: 'Gadgets',
    price: 11500,
    age: 2,
    condition: 'Excellent',
    originalPrice: 24990,
    description: 'Industry-leading noise cancellation headphones. Essential for studying in loud hostels or library study halls. Includes case and cables.',
    image: '/src/assets/images/marketplace_gadget_1793687146909.jpg',
    specifications: { ANC: 'Active Dual Sensor', Battery: '30h', Codecs: 'LDAC, AAC' }
  },
  {
    id: 'G02',
    title: 'Logitech MX Master 3S Wireless Mouse',
    category: 'Gadgets',
    price: 3800,
    age: 1,
    condition: 'Excellent',
    originalPrice: 8995,
    description: 'Ergonomic programmer mouse with electromagnetic scroll wheel and quiet clicks. Pairs with up to 3 computers.',
    image: '/src/assets/images/marketplace_gadget_1793687146909.jpg',
    specifications: { DPI: '8000', Connectivity: 'Bluetooth / Bolt', Battery: 'Rechargeable USB-C' }
  },
  {
    id: 'G03',
    title: 'Kindle Paperwhite 10th Gen (8GB)',
    category: 'Gadgets',
    price: 4200,
    age: 2,
    condition: 'Good',
    originalPrice: 9999,
    description: '300 ppi glare-free e-ink display. Waterproof, with adjustable backlight for late night reading.',
    image: '/src/assets/images/marketplace_gadget_1793687146909.jpg',
    specifications: { Storage: '8 GB', Screen: '6" 300ppi E-Ink', Waterproof: 'IPX8' }
  },
  {
    id: 'G04',
    title: 'Huion Inspiroy Graphic Drawing Tablet',
    category: 'Gadgets',
    price: 2100,
    age: 1,
    condition: 'Good',
    originalPrice: 4800,
    description: 'Battery-free stylus with 8192 levels of pressure sensitivity. Great for digital circuit diagrams, UI sketches, and math notes.',
    image: '/src/assets/images/marketplace_gadget_1793687146909.jpg',
    specifications: { ActiveArea: '8 x 5 inch', Pressure: '8192 Levels' }
  },
  {
    id: 'G05',
    title: 'USB Stereo Headset with Mic',
    category: 'Gadgets',
    price: 450,
    age: 3,
    condition: 'Average',
    originalPrice: 1200,
    description: 'Basic plug-and-play headset for Zoom classes and viva presentations.',
    image: '/src/assets/images/marketplace_gadget_1793687146909.jpg',
    specifications: { Interface: 'USB-A', Microphone: 'Noise cancelling boom' }
  },

  // Accessories
  {
    id: 'A01',
    title: 'Thule Subterra Campus Backpack 23L',
    category: 'Accessories',
    price: 1800,
    age: 1,
    condition: 'Excellent',
    originalPrice: 4500,
    description: 'Padded laptop sleeve fits up to 15.6" laptops. Water-resistant nylon, clean zippers, perfect ergonomic straps.',
    image: '/src/assets/images/marketplace_textbooks_1793687147552.jpg',
    specifications: { Capacity: '23 Liters', Material: '800D Nylon', Weight: '0.9 kg' }
  },
  {
    id: 'A02',
    title: 'Anker Nano II 65W GaN Fast Charger',
    category: 'Accessories',
    price: 1400,
    age: 1,
    condition: 'Good',
    originalPrice: 2999,
    description: 'Compact Gallium Nitride charger that powers both laptops and phones via USB-C Power Delivery.',
    image: '/src/assets/images/marketplace_gadget_1793687146909.jpg',
    specifications: { Output: '65W Max USB-C PD', Tech: 'GaN II' }
  },
  {
    id: 'A03',
    title: 'Aluminum Ergonomic Laptop Stand',
    category: 'Accessories',
    price: 650,
    age: 2,
    condition: 'Good',
    originalPrice: 1600,
    description: 'Elevates laptop screen to eye level to prevent neck strain during long coding sessions.',
    image: '/src/assets/images/marketplace_laptop_1793687146166.jpg',
    specifications: { Material: 'Sandblasted Aluminum', Compatibility: '11"-17" Laptops' }
  },

  // Electronics Lab & Hardware
  {
    id: 'EL01',
    title: 'Raspberry Pi 4 Model B (4GB) Lab Kit',
    category: 'Electronics',
    price: 4200,
    age: 1,
    condition: 'Excellent',
    listingType: 'buy',
    originalPrice: 7500,
    description: 'Complete IoT & Linux development board with official power supply, micro-HDMI cable, and acrylic cooling case.',
    image: '/src/assets/images/marketplace_gadget_1793687146909.jpg',
    specifications: { RAM: '4 GB LPDDR4', CPU: 'Quad-core Cortex-A72', Ports: 'Dual Micro-HDMI, USB 3.0' }
  },
  {
    id: 'EL02',
    title: 'Handheld Digital Storage Oscilloscope 50MHz',
    category: 'Electronics',
    price: 3400,
    age: 2,
    condition: 'Good',
    listingType: 'buy',
    originalPrice: 6500,
    description: 'Portable DSO with 2.8" color display and 200MSa/s real-time sampling rate. Excellent for hardware debugging.',
    image: '/src/assets/images/marketplace_gadget_1793687146909.jpg',
    specifications: { Bandwidth: '50 MHz', Channels: 'Single Channel', Battery: 'Rechargeable 3000mAh' }
  },
  {
    id: 'EL03',
    title: 'Arduino Mega 2560 Embedded Robotics Kit',
    category: 'Electronics',
    price: 1800,
    age: 1,
    condition: 'Good',
    listingType: 'buy',
    originalPrice: 3800,
    description: 'Includes 35 sensors, stepper motors, servo controllers, and jumper cables for micro-controller coursework.',
    image: '/src/assets/images/marketplace_gadget_1793687146909.jpg',
    specifications: { Board: 'ATmega2560', DigitalIO: '54 Pins', AnalogInputs: '16 Pins' }
  },

  // Edge cases demonstrating robust missing-value handling
  {
    id: 'E01',
    title: 'Casio Scientific Calculator fx-991EX',
    category: 'Gadgets',
    price: 850,
    age: undefined, // Missing age demonstration
    condition: 'Good',
    originalPrice: 1450,
    description: 'High-resolution ClassWiz calculator for engineering maths. Age not stated by seller, tested with weight renormalization.',
    image: '/src/assets/images/marketplace_gadget_1793687146909.jpg',
    specifications: { Functions: '552 Functions', Display: 'Natural Textbook Display' }
  },
  {
    id: 'E02',
    title: 'Campus Study Desk LED Lamp',
    category: 'Other',
    price: 600,
    age: 1,
    condition: undefined, // Missing condition demonstration
    originalPrice: 1200,
    description: 'Adjustable gooseneck study lamp with warm/cool lighting. Condition omitted in listing, dynamically renormalized.',
    image: '/src/assets/images/marketplace_textbooks_1793687147552.jpg',
    specifications: { Power: '10W LED USB powered', ColorTemp: '3000K-6000K' }
  },
  {
    id: 'E03',
    title: 'Engineering Mini Drafting Board A3',
    category: 'Other',
    price: 450,
    age: 2,
    condition: 'Average',
    originalPrice: undefined, // Missing original price demonstration
    description: 'Portable acrylic drafting board with parallel motion rule. Original price not provided; discount analysis omitted gracefully.',
    image: '/src/assets/images/marketplace_textbooks_1793687147552.jpg',
    specifications: { Size: 'A3 Standard', Material: 'Impact-resistant plastic' }
  }
];
