import { Department, ZoneConfig, VMStandard, DailyObservation } from '../types';

export const MANAGERS: string[] = [
  'AUREL',
  'MEY',
  'ROVIE',
  'FAHMI',
  'HAKIM',
  'DENIS',
  'CHOKY',
  'IDRUS',
  'SEPTIAN',
  'DWI'
];

export const ZONES: ZoneConfig[] = [
  {
    id: 'LIVING',
    name: 'LIVING ZONE',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    iconName: 'Sofa',
    departments: ['BA', 'BB', 'BL', 'BK', 'BM', 'BS', 'BH', 'FA']
  },
  {
    id: 'DINING',
    name: 'DINING ZONE',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    iconName: 'Utensils',
    departments: ['BD', 'BE', 'BC', 'BN', 'BO', 'DA', 'DB', 'DC', 'DD']
  },
  {
    id: 'SLEEPING',
    name: 'SLEEPING ZONE',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-300',
    iconName: 'BedDouble',
    departments: ['BI', 'BF', 'BG', 'BJ']
  },
  {
    id: 'COMMERCIAL',
    name: 'COMMERCIAL ZONE',
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-300',
    iconName: 'Briefcase',
    departments: ['BP', 'BQ', 'BR']
  }
];

export const DEPARTMENTS: Department[] = [
  // LIVING ZONE
  {
    code: 'BA',
    name: 'Sofa & Chair',
    zone: 'LIVING',
    category: 'HOME LIVING FURNI',
    psList: [
      { nip: '139563', name: 'DEAN RIZKYANDANI', phone: '085700955246', role: 'PS' },
      { nip: '116405', name: 'PIRMAN ALAMSYAH', phone: '088802229964', role: 'PS' }
    ],
    apsList: [
      { nip: '178197', name: 'RYAN YULIANTO', role: 'APS' },
      { nip: '176140', name: 'WAHYU PERMANA', role: 'APS' }
    ]
  },
  {
    code: 'BB',
    name: 'Table & Cabinet',
    zone: 'LIVING',
    category: 'HOME LIVING FURNI',
    psList: [
      { nip: '131184', name: 'DEDE ABDUL HAMID', phone: '085933233135', role: 'PS' },
      { nip: '99278', name: 'NASRUL LATIF', phone: '089669121118', role: 'PS' }
    ],
    apsList: [
      { nip: '168289', name: 'GABRIEL SEBASTIAN JAMES UMBOH', role: 'APS' },
      { nip: '103337', name: 'PRIMA MAELANA', role: 'APS' }
    ]
  },
  {
    code: 'BL',
    name: 'Home Textile',
    zone: 'LIVING',
    category: 'ACCSESORIES',
    psList: [
      { nip: '121708', name: 'SHELI MIGKA', phone: '085211540482', role: 'PS' },
      { nip: '106531', name: 'NURJAYA', phone: '08988104427', role: 'PS' }
    ],
    apsList: [
      { nip: '108387', name: 'CHOIRUN NISSA', role: 'APS' },
      { nip: '137443', name: 'ULFAN ADITA PRATAMA', role: 'APS' }
    ]
  },
  {
    code: 'BK',
    name: 'Home Decore',
    zone: 'LIVING',
    category: 'ACCSESORIES',
    psList: [
      { nip: '94871', name: 'BENNI ARIA CITRA PERMANA.', phone: '0895326355097', role: 'PS' },
      { nip: '90862', name: 'SUPRIYADI', phone: '081210159620', role: 'PS' }
    ],
    apsList: [
      { nip: '172000', name: 'AZRIM ANGKONI', role: 'APS' },
      { nip: '110376', name: 'FEBIN EDWANSYAH', role: 'APS' }
    ]
  },
  {
    code: 'BM',
    name: 'Home Organizer',
    zone: 'LIVING',
    category: 'ORGANIZER FURNI',
    psList: [
      { nip: '90861', name: 'ANDRI', phone: '089625441213', role: 'PS' }
    ],
    apsList: [
      { nip: '105269', name: 'AHMAD SOBANDI', role: 'APS' }
    ]
  },
  {
    code: 'BS',
    name: 'Home Galleria',
    zone: 'LIVING',
    category: 'PREMIUM FURNI',
    psList: [
      { nip: '118286', name: 'JATMIKO EDY TANTOMO', phone: '085753305667', role: 'PS' }
    ],
    apsList: [
      { nip: '165513', name: 'MOH FARHAN NURRAHMAN', role: 'APS' }
    ]
  },
  {
    code: 'BH',
    name: 'Bathroom',
    zone: 'LIVING',
    category: 'ORGANIZER FURNI',
    psList: [
      { nip: '95386', name: 'ERWIN SYAMSUDIN.', phone: '0895345044998', role: 'PS' }
    ],
    apsList: []
  },
  {
    code: 'FA',
    name: 'Fashion Bags',
    zone: 'LIVING',
    category: 'ACCSESORIES',
    psList: [
      { nip: '95386', name: 'ERWIN SYAMSUDIN.', phone: '0895345044998', role: 'PS' }
    ],
    apsList: [
      { nip: '137443', name: 'ULFAN ADITA PRATAMA', role: 'APS' }
    ]
  },

  // DINING ZONE
  {
    code: 'BD',
    name: 'Dining',
    zone: 'DINING',
    category: 'HOME LIVING FURNI',
    psList: [
      { nip: '106533', name: 'LUTFI AZIS ARRASYID', phone: '089648197856', role: 'PS' },
      { nip: '104140', name: 'VICKY ALFARIZI', phone: '08979129769', role: 'PS' }
    ],
    apsList: [
      { nip: '171189', name: 'ABDURAHMAN WAHID', role: 'APS' },
      { nip: '175496', name: 'FATHAN AZIS', role: 'APS' }
    ]
  },
  {
    code: 'BE',
    name: 'Kitchen',
    zone: 'DINING',
    category: 'HOME LIVING FURNI',
    psList: [
      { nip: '106477', name: 'BAYU SUKANDANI', phone: '083876157283', role: 'PS' }
    ],
    apsList: [
      { nip: '192303', name: 'AUDY ALIF PUTRA', role: 'APS' }
    ]
  },
  {
    code: 'BC',
    name: 'Home Classic',
    zone: 'DINING',
    category: 'HOME LIVING FURNI',
    psList: [
      { nip: '106441', name: 'CECEP RIKI', phone: '', role: 'PS' },
      { nip: '100192', name: 'JAKA SATRIA FADLI', phone: '082211108932', role: 'PS' }
    ],
    apsList: [
      { nip: '102885', name: 'SUKMA ANDIKA', role: 'APS' },
      { nip: '117452', name: 'DODI SANMARTIN', role: 'APS' }
    ]
  },
  {
    code: 'BN',
    name: 'Homeware',
    zone: 'DINING',
    category: 'ACCSESORIES',
    psList: [
      { nip: '103196', name: 'ONKY RAMDHANI.', phone: '087720440466', role: 'PS' },
      { nip: '101848', name: 'M. YURIYANSYAH', phone: '087883845995', role: 'PS' }
    ],
    apsList: [
      { nip: '166968', name: 'MOHAMMAD RIZALY FAHMI AFANDI', role: 'APS' },
      { nip: '177065', name: 'VANNY ERIYANI', role: 'APS' },
      { nip: '182110', name: 'HAFIDZ ABDULLAH', role: 'APS' },
      { nip: '185551', name: 'DICKY SETIAWAN', role: 'APS' }
    ]
  },
  {
    code: 'BO',
    name: 'Decorative Lighting',
    zone: 'DINING',
    category: 'ACCSESORIES',
    psList: [
      { nip: '96814', name: 'ARIE SURIANTO', phone: '087779168532', role: 'PS' }
    ],
    apsList: [
      { nip: '148068', name: 'ZAM ZAM SALEHUDIN AHMADI', role: 'APS' }
    ]
  },
  {
    code: 'DA',
    name: 'KELS - Major Domestic Appliances',
    zone: 'DINING',
    category: 'APPLIANCES',
    psList: [
      { nip: '131011', name: 'IVAN MUSTASVA ARIANTO', phone: '085777658707', role: 'PS' }
    ],
    apsList: [
      { nip: '179029', name: 'YUDA ADITYA NUGRAHA', role: 'APS' }
    ]
  },
  {
    code: 'DB',
    name: 'KELS - Small Domestic Appliances',
    zone: 'DINING',
    category: 'APPLIANCES',
    psList: [
      { nip: '131011', name: 'IVAN MUSTASVA ARIANTO', phone: '085777658707', role: 'PS' }
    ],
    apsList: []
  },
  {
    code: 'DC',
    name: 'KELS - Health Care',
    zone: 'DINING',
    category: 'APPLIANCES',
    psList: [
      { nip: '134298', name: 'CHAIRUL IMAN', phone: '081326670405', role: 'PS' }
    ],
    apsList: [
      { nip: '122727', name: 'RETNO BUDI RIANTO', role: 'APS' }
    ]
  },
  {
    code: 'DD',
    name: 'KELS - Beauty Care',
    zone: 'DINING',
    category: 'APPLIANCES',
    psList: [
      { nip: '134298', name: 'CHAIRUL IMAN', phone: '081326670405', role: 'PS' }
    ],
    apsList: []
  },

  // SLEEPING ZONE
  {
    code: 'BI',
    name: 'Kids Space',
    zone: 'SLEEPING',
    category: 'FURNITURE',
    psList: [
      { nip: '94992', name: 'CIPTO NUGROHO', phone: '0895331690279', role: 'PS' }
    ],
    apsList: [
      { nip: '106202', name: 'PEPI FIRDAUS', role: 'APS' }
    ]
  },
  {
    code: 'BF',
    name: 'Bedroom',
    zone: 'SLEEPING',
    category: 'SLEEPING FURNI',
    psList: [
      { nip: '103408', name: 'DODI MISBAHUDIN', phone: '081382978584', role: 'PS' },
      { nip: '98457', name: 'SANDI JATNIKA', phone: '081382386080', role: 'PS' }
    ],
    apsList: [
      { nip: '119738', name: 'NANDA WARIZKA', role: 'APS' },
      { nip: '173763', name: 'FERHANS IQBAL HERDIANSYAH', role: 'APS' }
    ]
  },
  {
    code: 'BG',
    name: 'Mattress',
    zone: 'SLEEPING',
    category: 'SLEEPING FURNI',
    psList: [
      { nip: '161643', name: 'MUCHAMMAD SOFYAN', phone: '085311410522', role: 'PS' }
    ],
    apsList: [
      { nip: '119861', name: 'ANGKY LESMANA', role: 'APS' }
    ]
  },
  {
    code: 'BJ',
    name: 'Textile Bedding',
    zone: 'SLEEPING',
    category: 'ACCSESORIES',
    psList: [
      { nip: '101854', name: 'SIGIT SANJAYA', phone: '081906788355', role: 'PS' },
      { nip: '96806', name: 'HAYANIH.', phone: '087871985670', role: 'PS' }
    ],
    apsList: [
      { nip: '154251', name: 'FITRI SILPANI', role: 'APS' },
      { nip: '176928', name: 'REPAN', role: 'APS' }
    ]
  },

  // COMMERCIAL ZONE
  {
    code: 'BP',
    name: 'Office',
    zone: 'COMMERCIAL',
    category: 'COMMERCIAL ZONE',
    psList: [
      { nip: '130203', name: 'LISTANTO', phone: '083878551421', role: 'PS' },
      { nip: '108392', name: 'SYAFRIANSYAH', phone: '083872851129', role: 'PS' }
    ],
    apsList: [
      { nip: '176927', name: 'ALDI', role: 'APS' }
    ]
  },
  {
    code: 'BQ',
    name: 'Office Seating',
    zone: 'COMMERCIAL',
    category: 'COMMERCIAL ZONE',
    psList: [
      { nip: '5470', name: 'ALI SOPJAN', phone: '085781063376', role: 'PS' },
      { nip: '70089', name: 'HANNY RUDI RIANTO', phone: '089651549373', role: 'PS' }
    ],
    apsList: [
      { nip: '176649', name: 'PREDIANSYAH', role: 'APS' }
    ]
  },
  {
    code: 'BR',
    name: 'Commercial & Bussines',
    zone: 'COMMERCIAL',
    category: 'COMMERCIAL ZONE',
    psList: [
      { nip: '101861', name: 'IRONA WULANDARI', phone: '085921390747', role: 'PS' },
      { nip: '122147', name: 'KHOMARUDIN', phone: '081803094317', role: 'PS' }
    ],
    apsList: [
      { nip: '154035', name: 'MOCHAMMAD SANWANI', role: 'APS' },
      { nip: '94840', name: 'LUKMANUL HAKIM.', role: 'APS' }
    ]
  }
];

export const DEFAULT_CHECKLIST_TEMPLATE = [
  { id: 'cleanliness', label: 'Kebersihan area display & bebas debu' },
  { id: 'pop_pricetag', label: 'Kelengkapan & kerapian Price Tag / POP Promo' },
  { id: 'vm_spacing', label: 'Layout & spacing produk sesuai VM Planogram' },
  { id: 'lighting', label: 'Pencahayaan spotlight tepat sasaran & berfungsi' },
  { id: 'sample_condition', label: 'Kondisi sample/display utuh & tidak cacat' },
  { id: 'cushion_styling', label: 'Styling bantal/aksesori rapi & proporsional' }
];

export const INITIAL_VM_STANDARDS: Record<string, VMStandard> = {
  BA: {
    deptCode: 'BA',
    standardPhotoUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
    rules: [
      'Sofa utama wajib menghadap gangway utama dengan sudut 45 derajat',
      'Cushion disusun bergradasi warna dari gelap di belakang ke terang di depan',
      'Price tag akrilik diletakkan di sudut kanan armrest, dilarang miring',
      'Coffee table pelengkap diberi 1 vas bunga minimalis dan 1 buku display'
    ],
    keyPoints: ['Angle 45°', 'Cushion 3 layer', 'Acrylic Tag Kanan', 'Spotlight 3000K'],
    updatedAt: '2026-09-18',
    updatedBy: 'Team VM Pusat'
  },
  BB: {
    deptCode: 'BB',
    standardPhotoUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80',
    rules: [
      'Meja kabinet ditata sejajar dengan jarak antar display minimal 80cm',
      'Pintu kabinet ditutup rapat dan laci dirapikan',
      'Label harga ditempel pada holder resmi di tepi kanan atas'
    ],
    keyPoints: ['Jarak 80cm', 'Laci Rapat', 'Holder Akrilik'],
    updatedAt: '2026-09-18',
    updatedBy: 'Team VM Pusat'
  },
  BD: {
    deptCode: 'BD',
    standardPhotoUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop&q=80',
    rules: [
      'Dining set lengkap 4/6 kursi disusun simetris menghadap meja',
      'Table runner dipasang di tengah meja secara presisi',
      'Tableware dummy dipasang 2 set untuk memberikan visual dining experience'
    ],
    keyPoints: ['Simetri Kursi', 'Table Runner Tengah', 'Tableware Setup'],
    updatedAt: '2026-09-18',
    updatedBy: 'Team VM Pusat'
  },
  BF: {
    deptCode: 'BF',
    standardPhotoUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&auto=format&fit=crop&q=80',
    rules: [
      'Sprei dan bed cover disetrika kencang tanpa kerutan',
      'Pillow disusun 2 baris (bantal tidur di belakang, bantal aksen di depan)',
      'Bed runner dibentangkan di ujung kasur dengan jarak 30cm dari tepi bawah'
    ],
    keyPoints: ['Bed Kencang', '2 Layer Bantal', 'Bed Runner 30cm'],
    updatedAt: '2026-09-18',
    updatedBy: 'Team VM Pusat'
  },
  BP: {
    deptCode: 'BP',
    standardPhotoUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80',
    rules: [
      'Meja kerja kantor dilengkapi kursi ergonomis yang diputar ke arah lorong',
      'Kabel display komputer/lampu meja dirapikan dengan cable organizer tertutup',
      'Brosur spesifikasi diletakkan rapi di holder transparan'
    ],
    keyPoints: ['Kabel Tertutup', 'Kursi Rapi', 'Holder Transparan'],
    updatedAt: '2026-09-18',
    updatedBy: 'Team VM Pusat'
  }
};

export const INITIAL_OBSERVATIONS: DailyObservation[] = [
  {
    id: 'obs-20260919-01',
    date: '2026-09-19',
    deptCode: 'BA',
    deptName: 'Sofa & Chair',
    zoneId: 'LIVING',
    status: 'NON_STANDARD',
    managerName: 'AUREL',
    inspectionTime: '08:45',
    managerNotes: 'Bantal sofa velvet berantakan dan ada 2 Price Tag akrilik miring di armrest sofa 3-seater.',
    findingPhotoUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
    vmStandardPhotoUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
    checklist: [
      { id: 'cleanliness', label: 'Kebersihan area display & bebas debu', passed: true },
      { id: 'pop_pricetag', label: 'Kelengkapan & kerapian Price Tag / POP Promo', passed: false, notes: 'Akrilik miring' },
      { id: 'vm_spacing', label: 'Layout & spacing produk sesuai VM Planogram', passed: true },
      { id: 'lighting', label: 'Pencahayaan spotlight tepat sasaran & berfungsi', passed: true },
      { id: 'sample_condition', label: 'Kondisi sample/display utuh & tidak cacat', passed: true },
      { id: 'cushion_styling', label: 'Styling bantal/aksesori rapi & proporsional', passed: false, notes: 'Bantal berantakan' }
    ],
    assignedPsName: 'DEAN RIZKYANDANI',
    createdAt: '2026-09-19T08:45:00.000Z',
    updatedAt: '2026-09-19T08:45:00.000Z'
  },
  {
    id: 'obs-20260919-02',
    date: '2026-09-19',
    deptCode: 'BD',
    deptName: 'Dining',
    zoneId: 'DINING',
    status: 'RESOLVED',
    managerName: 'ROVIE',
    inspectionTime: '09:15',
    managerNotes: 'Tableware dummy tidak lengkap di meja makan marmer 6 kursi, piring dessert miring.',
    findingPhotoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
    vmStandardPhotoUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop&q=80',
    resolutionPhotoUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop&q=80',
    checklist: [
      { id: 'cleanliness', label: 'Kebersihan area display & bebas debu', passed: true },
      { id: 'pop_pricetag', label: 'Kelengkapan & kerapian Price Tag / POP Promo', passed: true },
      { id: 'vm_spacing', label: 'Layout & spacing produk sesuai VM Planogram', passed: true },
      { id: 'lighting', label: 'Pencahayaan spotlight tepat sasaran & berfungsi', passed: true },
      { id: 'sample_condition', label: 'Kondisi sample/display utuh & tidak cacat', passed: true },
      { id: 'cushion_styling', label: 'Styling bantal/aksesori rapi & proporsional', passed: true }
    ],
    assignedPsName: 'LUTFI AZIS ARRASYID',
    resolvedByPsName: 'LUTFI AZIS ARRASYID',
    executionTime: '09:50',
    psNotes: 'Sudah ditata ulang tableware 2 set lengkap simetris dan table runner disetrika kembali.',
    createdAt: '2026-09-19T09:15:00.000Z',
    updatedAt: '2026-09-19T09:50:00.000Z'
  },
  {
    id: 'obs-20260919-03',
    date: '2026-09-19',
    deptCode: 'BF',
    deptName: 'Bedroom',
    zoneId: 'SLEEPING',
    status: 'STANDARD',
    managerName: 'FAHMI',
    inspectionTime: '10:00',
    managerNotes: 'Display sangat rapi, bedcover kencang dan spotlight fokus sesuai standar VM.',
    vmStandardPhotoUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&auto=format&fit=crop&q=80',
    checklist: [
      { id: 'cleanliness', label: 'Kebersihan area display & bebas debu', passed: true },
      { id: 'pop_pricetag', label: 'Kelengkapan & kerapian Price Tag / POP Promo', passed: true },
      { id: 'vm_spacing', label: 'Layout & spacing produk sesuai VM Planogram', passed: true },
      { id: 'lighting', label: 'Pencahayaan spotlight tepat sasaran & berfungsi', passed: true },
      { id: 'sample_condition', label: 'Kondisi sample/display utuh & tidak cacat', passed: true },
      { id: 'cushion_styling', label: 'Styling bantal/aksesori rapi & proporsional', passed: true }
    ],
    createdAt: '2026-09-19T10:00:00.000Z',
    updatedAt: '2026-09-19T10:00:00.000Z'
  },
  {
    id: 'obs-20260918-01',
    date: '2026-09-18',
    deptCode: 'BP',
    deptName: 'Office',
    zoneId: 'COMMERCIAL',
    status: 'RESOLVED',
    managerName: 'MEY',
    inspectionTime: '14:20',
    managerNotes: 'Kabel charger di meja meeting terbuka dan berantakan.',
    findingPhotoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
    vmStandardPhotoUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80',
    resolutionPhotoUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80',
    checklist: [
      { id: 'cleanliness', label: 'Kebersihan area display & bebas debu', passed: true },
      { id: 'pop_pricetag', label: 'Kelengkapan & kerapian Price Tag / POP Promo', passed: true },
      { id: 'vm_spacing', label: 'Layout & spacing produk sesuai VM Planogram', passed: false },
      { id: 'lighting', label: 'Pencahayaan spotlight tepat sasaran & berfungsi', passed: true },
      { id: 'sample_condition', label: 'Kondisi sample/display utuh & tidak cacat', passed: true },
      { id: 'cushion_styling', label: 'Styling bantal/aksesori rapi & proporsional', passed: true }
    ],
    assignedPsName: 'LISTANTO',
    resolvedByPsName: 'LISTANTO',
    executionTime: '15:10',
    psNotes: 'Kabel dimasukkan ke cable duct di bawah meja kerja, rapi total.',
    createdAt: '2026-09-18T14:20:00.000Z',
    updatedAt: '2026-09-18T15:10:00.000Z'
  },
  {
    id: 'obs-20260919-04',
    date: '2026-09-19',
    deptCode: 'BB',
    deptName: 'Living Room',
    zoneId: 'LIVING',
    status: 'RESOLVED',
    managerName: 'AGAM',
    inspectionTime: '08:30',
    managerNotes: 'Karpet rug bergelombang dan coffee table belum di-dusting.',
    findingPhotoUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
    vmStandardPhotoUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
    resolutionPhotoUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
    checklist: [
      { id: 'cleanliness', label: 'Kebersihan area display & bebas debu', passed: true },
      { id: 'pop_pricetag', label: 'Kelengkapan & kerapian Price Tag / POP Promo', passed: true },
      { id: 'vm_spacing', label: 'Layout & spacing produk sesuai VM Planogram', passed: true }
    ],
    assignedPsName: 'EDO YULIANTO',
    resolvedByPsName: 'EDO YULIANTO',
    executionTime: '08:55',
    psNotes: 'Karpet ditarik kencang, coffee table sudah dilap microfiber dan di-waxing.',
    createdAt: '2026-09-19T08:30:00.000Z',
    updatedAt: '2026-09-19T08:55:00.000Z'
  },
  {
    id: 'obs-20260919-05',
    date: '2026-09-19',
    deptCode: 'BL',
    deptName: 'Lighting',
    zoneId: 'COMMERCIAL',
    status: 'RESOLVED',
    managerName: 'ROVIE',
    inspectionTime: '11:00',
    managerNotes: 'Lampu gantung pendant mati 1 bohlam dan kabel terlihat menjuntai.',
    findingPhotoUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
    vmStandardPhotoUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80',
    resolutionPhotoUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80',
    checklist: [
      { id: 'lighting', label: 'Pencahayaan spotlight tepat sasaran & berfungsi', passed: true },
      { id: 'cleanliness', label: 'Kebersihan area display & bebas debu', passed: true }
    ],
    assignedPsName: 'FAJAR KURNIA',
    resolvedByPsName: 'FAJAR KURNIA',
    executionTime: '11:38',
    psNotes: 'Bohlam LED diganti baru dan kabel dirapikan pakai klem transparan.',
    createdAt: '2026-09-19T11:00:00.000Z',
    updatedAt: '2026-09-19T11:38:00.000Z'
  },
  {
    id: 'obs-20260919-06',
    date: '2026-09-19',
    deptCode: 'BE',
    deptName: 'Mattress',
    zoneId: 'SLEEPING',
    status: 'STANDARD',
    managerName: 'ROVIE',
    inspectionTime: '10:30',
    managerNotes: 'Display matras sangat rapi, bed skirt rata dan pillow protector bersih.',
    vmStandardPhotoUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop&q=80',
    checklist: [
      { id: 'cleanliness', label: 'Kebersihan area display & bebas debu', passed: true },
      { id: 'pop_pricetag', label: 'Kelengkapan & kerapian Price Tag / POP Promo', passed: true }
    ],
    createdAt: '2026-09-19T10:30:00.000Z',
    updatedAt: '2026-09-19T10:30:00.000Z'
  },
  {
    id: 'obs-20260919-07',
    date: '2026-09-19',
    deptCode: 'BC',
    deptName: 'Living Case Goods',
    zoneId: 'LIVING',
    status: 'RESOLVED',
    managerName: 'MEY',
    inspectionTime: '10:10',
    managerNotes: 'Pintu lemari display tidak tertutup rapat dan ada sidik jari di kaca.',
    findingPhotoUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80',
    vmStandardPhotoUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80',
    resolutionPhotoUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80',
    checklist: [
      { id: 'cleanliness', label: 'Kebersihan area display & bebas debu', passed: true },
      { id: 'sample_condition', label: 'Kondisi sample/display utuh & tidak cacat', passed: true }
    ],
    assignedPsName: 'DEDI HERMAWAN',
    resolvedByPsName: 'DEDI HERMAWAN',
    executionTime: '11:02',
    psNotes: 'Engsel pintu disetel ulang rata, kaca dibersihkan dengan glass cleaner.',
    createdAt: '2026-09-19T10:10:00.000Z',
    updatedAt: '2026-09-19T11:02:00.000Z'
  }
];
