/* ==========================================================================
   LEO-CURLING (CUKUR KELILING) - CATALOG DATA SUNDA BUHUN
   Featured: Bang Leo (Founder, Owner Utama & Brand Ambassador)
   ========================================================================== */

const MALE_STYLES = [
  {
    id: 'm1',
    name: 'Gaya Ksatria Ciung Wanara (Low Taper Fade)',
    gender: 'pria',
    price: 25000,
    duration: '35 Min',
    image: 'src/images/bangleo_owner.jpg', // Bang Leo as Role Model & Brand Ambassador!
    description: 'Model gaya rambut khas Bang Leo (Owner & Brand Ambassador). Gradasi halus bagian samping & leher dengan puncak mahkota rambut rapi & gagah ala Ksatria Pajajaran.'
  },
  {
    id: 'm2',
    name: 'Gaya Prabu Siliwangi (Executive Side Part)',
    gender: 'pria',
    price: 35000,
    duration: '35 Min',
    image: 'src/images/bangleo_owner.jpg',
    description: 'Potongan belah samping klimis bermartabat tinggi, mencerminkan wibawa kepemimpinan raja Sunda buhun.'
  },
  {
    id: 'm3',
    name: 'Gaya Munding Laya (Textured Crop)',
    gender: 'pria',
    price: 25000,
    duration: '30 Min',
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80',
    description: 'Potongan poni depan rata bertekstur tangguh & pemberani. Sangat modis untuk pemuda Wanayasa kekinian.'
  },
  {
    id: 'm4',
    name: 'Gaya Baduy Kencana (Classic Pompadour)',
    gender: 'pria',
    price: 30000,
    duration: '40 Min',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    description: 'Rambut bagian atas bervolume tinggi disisir rapi ke belakang dengan sentuhan gaya klasik yang meledak.'
  },
  {
    id: 'm5',
    name: 'Gaya Sangkuriang (Slicked Back Undercut)',
    gender: 'pria',
    price: 20000,
    duration: '30 Min',
    image: 'https://images.unsplash.com/photo-1517832606589-71574620396d?auto=format&fit=crop&w=600&q=80',
    description: 'Sisi samping tipis bersih kontras dengan rambut atas yang disisir licin penuh percaya diri.'
  },
  {
    id: 'm6',
    name: 'Gaya Maung Bodas (Modern Mullet Wolf Cut)',
    gender: 'pria',
    price: 40000,
    duration: '45 Min',
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=600&q=80',
    description: 'Kombinasi gaya mullet bertekstur bebas ala maung (harimau), unik, berani, dan berkarakter kuat.'
  }
];

const FEMALE_STYLES = [
  {
    id: 'f1',
    name: 'Gaya Nyi Pohaci (Modern Butterfly Cut)',
    gender: 'wanita',
    price: 40000,
    duration: '45 Min',
    image: 'src/images/female_butterfly.jpg',
    description: 'Layer bertingkat mengalir indah bagai keanggunan Dewi Padi. Memberikan volume rambut yang mekar sempurna.'
  },
  {
    id: 'f2',
    name: 'Gaya Dayang Sumbi (French Bob & Curtain Bangs)',
    gender: 'wanita',
    price: 30000,
    duration: '35 Min',
    image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=600&q=80',
    description: 'Potongan bob se-dagu cantik dengan poni tirai memikat yang membingkai paras wajah memesona.'
  },
  {
    id: 'f3',
    name: 'Gaya Ratu Shima (Glass Hair Long Bob)',
    gender: 'wanita',
    price: 35000,
    duration: '35 Min',
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80',
    description: 'Long Bob lurus mengkilap bagai cermin. Tampilan tegas, bersih, dan memancarkan aura wibawa.'
  },
  {
    id: 'f4',
    name: 'Gaya Citra Rashmi (Shaggy Layered Wolf Cut)',
    gender: 'wanita',
    price: 35000,
    duration: '40 Min',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=600&q=80',
    description: 'Layer tekstur acak alami yang modis & bergelombang. Sangat stylish untuk wanita modern yang aktif.'
  },
  {
    id: 'f5',
    name: 'Gaya Galuh Pakuan (Soft Beach Waves)',
    gender: 'wanita',
    price: 40000,
    duration: '45 Min',
    image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=600&q=80',
    description: 'Layer panjang bergelombang lembut bagai kejernihan sungai Kerajaan Galuh yang menenangkan.'
  },
  {
    id: 'f6',
    name: 'Gaya Purbararang (Textured Pixie Cut)',
    gender: 'wanita',
    price: 25000,
    duration: '30 Min',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    description: 'Potongan pendek praktis manis. Ringan, memberi kesan percaya diri, segar, dan tetap feminin.'
  }
];

const ADDITIONAL_SERVICES = [
  { id: 's1', name: 'Cuci Rambut & Pijat Kepala Relaksasi', price: 10000 },
  { id: 's2', name: 'Grooming Kumis & Jenggot Rapi', price: 10000 },
  { id: 's3', name: 'Vitamin & Scalp Care Hair Treatment', price: 15000 }
];

const BARBERS = [
  { id: 'b1', name: 'Bang Leo (Owner Utama, Ambassador & Master Barber)', rating: '5.0 ⭐' },
  { id: 'b2', name: 'Tim Capster Keliling Wanayasa', rating: '4.9 ⭐' }
];

const MOCK_INITIAL_ORDERS = [
  {
    id: 'LC-101',
    customerName: 'Kang Asep',
    phone: '081234567890',
    address: 'Jl. Raya Wanayasa No. 18, Depan Alun-Alun Wanayasa',
    lat: -6.6976,
    lng: 107.5628,
    notes: 'Rumah cat hijau dekat masjid, samping warung.',
    hairStyle: 'Gaya Ksatria Ciung Wanara (Low Taper Fade)',
    barber: 'Bang Leo (Owner Utama, Ambassador & Master Barber)',
    date: '2026-08-21',
    time: '09:00',
    totalPrice: 25000,
    status: 'enroute',
    createdAt: '2026-08-20T20:30:00.000Z'
  },
  {
    id: 'LC-102',
    customerName: 'Teh Nining',
    phone: '085711223344',
    address: 'Desa Raharja, Kec. Wanayasa',
    lat: -6.7012,
    lng: 107.5655,
    notes: 'Dekat lapangan bola Wanayasa.',
    hairStyle: 'Gaya Nyi Pohaci (Modern Butterfly Cut)',
    barber: 'Bang Leo (Owner Utama, Ambassador & Master Barber)',
    date: '2026-08-21',
    time: '13:00',
    totalPrice: 40000,
    status: 'pending',
    createdAt: '2026-08-20T21:00:00.000Z'
  }
];
