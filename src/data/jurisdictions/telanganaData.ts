import type { DistrictInfo, AdministrativeUnitInfo } from './types';

export const TELANGANA_DISTRICTS: DistrictInfo[] = [
  { id: 'dist-adilabad', name: 'Adilabad', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-bhadradri-kothagudem', name: 'Bhadradri Kothagudem', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-hanumakonda', name: 'Hanumakonda', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-hyderabad', name: 'Hyderabad', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-jagtial', name: 'Jagtial', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-jangaon', name: 'Jangaon', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-jayashankar-bhupalpally', name: 'Jayashankar Bhupalpally', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-jogulamba-gadwal', name: 'Jogulamba Gadwal', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-kamareddy', name: 'Kamareddy', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-karimnagar', name: 'Karimnagar', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-khammam', name: 'Khammam', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-kumuram-bheem', name: 'Kumuram Bheem', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-mahabubabad', name: 'Mahabubabad', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-mahabubnagar', name: 'Mahabubnagar', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-mancherial', name: 'Mancherial', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-medak', name: 'Medak', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-medchal-malkajgiri', name: 'Medchal-Malkajgiri', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-mulugu', name: 'Mulugu', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-nagarkurnool', name: 'Nagarkurnool', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-nalgonda', name: 'Nalgonda', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-narayanpet', name: 'Narayanpet', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-nirmal', name: 'Nirmal', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-nizamabad', name: 'Nizamabad', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-peddapalli', name: 'Peddapalli', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-rajanna-sircilla', name: 'Rajanna Sircilla', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-rangareddy', name: 'Rangareddy', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-sangareddy', name: 'Sangareddy', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-siddipet', name: 'Siddipet', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-suryapet', name: 'Suryapet', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-vikarabad', name: 'Vikarabad', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-wanaparthy', name: 'Wanaparthy', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-warangal', name: 'Warangal', stateId: 'telangana', stateCode: 'TG' },
  { id: 'dist-yadadri-bhuvanagiri', name: 'Yadadri Bhuvanagiri', stateId: 'telangana', stateCode: 'TG' },
];

export const TELANGANA_RAW_MANDAL_MAP: Record<string, string[]> = {
  'dist-adilabad': [
    'Adilabad Rural', 'Adilabad Urban', 'Bazarhatnoor', 'Bela', 'Bheempur', 'Boath', 'Gadiguda',
    'Gudihatnoor', 'Ichoda', 'Indervelly', 'Jainad', 'Mavala', 'Narnoor', 'Neradigonda', 'Sirikonda',
    'Talamadugu', 'Tamsi', 'Utnoor'
  ],
  'dist-bhadradri-kothagudem': [
    'Allapalli', 'Annapureddypally', 'Aswapuram', 'Aswaraopeta', 'Burgampahad', 'Chandrugonda', 'Cherla',
    'Chunchupally', 'Dammapeta', 'Dummugudem', 'Gundala', 'Julurpad', 'Karakagudem', 'Kothagudem',
    'Laxmidevipally', 'Manuguru', 'Mulakalapally', 'Palwancha', 'Pinapaka', 'Sujathanagar', 'Tekulapally',
    'Yellandu', 'Sarapaka', 'Seethampeta'
  ],
  'dist-hanumakonda': [
    'Bheemadevarpalle', 'Dharmasagar', 'Elkathurthi', 'Hasanparthy', 'Hanamkonda', 'Inavole', 'Kamalapur',
    'Kazipet', 'Nadikuda', 'Parkal', 'Shayampet', 'Velair', 'Warangal West', 'Kila Warangal'
  ],
  'dist-hyderabad': [
    'Amberpet', 'Ameerpet', 'Asifnagar', 'Bahadurpura', 'Bandlaguda', 'Charminar', 'Golconda',
    'Himayathnagar', 'Khairatabad', 'Maredpally', 'Musheerabad', 'Nampally', 'Saidabad', 'Secunderabad',
    'Shaikpet', 'Tirumalagiri'
  ],
  'dist-jagtial': [
    'Beerpur', 'Buggaram', 'Dharmapuri', 'Gollapally', 'Ibrahimpatnam', 'Jagtial', 'Jagtial Rural',
    'Kathlapur', 'Kodimial', 'Korutla', 'Mallial', 'Mallapur', 'Medipally', 'Metpally', 'Pegadapally',
    'Raikal', 'Sarangapur', 'Velgatoor', 'Endapally', 'Bheemaram'
  ],
  'dist-jangaon': [
    'Bachannapeta', 'Chilpur', 'Devaruppula', 'Gundala', 'Jangaon', 'Lingalaghanpur', 'Narmetta',
    'Palakurthi', 'Raghunathpalle', 'Station Ghanpur', 'Tarigoppula', 'Zaffergadh'
  ],
  'dist-jayashankar-bhupalpally': [
    'Bhupalpally', 'Chityal', 'Ghanpur (Mulug)', 'Kataram', 'Mahadevpur', 'Maha Mutharam', 'Malhar Rao',
    'Mogullapally', 'Palimela', 'Regonda', 'Tekumatla'
  ],
  'dist-jogulamba-gadwal': [
    'Alampur', 'Dharur', 'Gadwal', 'Ghattu', 'Ieeja', 'Itikyal', 'Kaloor Timmanadoddi', 'Maldakal',
    'Manopad', 'Rajoli', 'Undavelly', 'Waddepalle'
  ],
  'dist-kamareddy': [
    'Banswada', 'Bibipet', 'Bhiknoor', 'Birkoor', 'Domakonda', 'Dongli', 'Gandhari', 'Jukkal',
    'Kamareddy', 'Lingampet', 'Machareddy', 'Madnoor', 'Menoor', 'Nagireddypet', 'Nasrullabad',
    'Nizamsagar', 'Pitlam', 'Rajampet', 'Ramareddy', 'Sadashivanagar', 'Tadwai', 'Yellareddy', 'Mohammednagar'
  ],
  'dist-karimnagar': [
    'Chigurumamidi', 'Choppadandi', 'Ellanthakunta', 'Gangadhara', 'Ganneruvaram', 'Huzurabad',
    'Jammikunta', 'Karimnagar (Rural)', 'Karimnagar (Urban)', 'Kothapalli', 'Manakondur', 'Ramadugu',
    'Saidapur', 'Shankarapatnam', 'Thimmapur', 'Veenavanka'
  ],
  'dist-khammam': [
    'Bonakal', 'Chinthakani', 'Enkoor', 'Kallur', 'Kamepally', 'Khammam (Rural)', 'Khammam (Urban)',
    'Konijerla', 'Kusumanchi', 'Madhira', 'Mudigonda', 'Nelakondapally', 'Penuballi', 'Raghunadhapalem',
    'Sathupally', 'Singareni', 'Tallada', 'Thirumalayapalem', 'Vemsoor', 'Wyra', 'Yerrupalem'
  ],
  'dist-kumuram-bheem': [
    'Asifabad', 'Bejjur', 'Chintalamanepally', 'Dahegaon', 'Jainoor', 'Kagaznagar', 'Kerameri',
    'Kouthala', 'Lingapur', 'Penchikalpet', 'Rebbena', 'Sirpur (T)', 'Sirpur (U)', 'Tiryani', 'Wankidi'
  ],
  'dist-mahabubabad': [
    'Bayyaram', 'Chinnagudur', 'Danthalapalle', 'Dornakal', 'Gangaram', 'Garla', 'Gudur', 'Kesamudram',
    'Kothaguda', 'Kuravi', 'Mahabubabad', 'Maripeda', 'Narsimhulapet', 'Nellikudur', 'Peddavangara', 'Seerole'
  ],
  'dist-mahabubnagar': [
    'Addakal', 'Bala Nagar', 'Bhoothpur', 'C.C. Kunta', 'Devarakadra', 'Gandeed', 'Hanwada', 'Jadcherla',
    'Koilkonda', 'Mahabubnagar Rural', 'Mahabubnagar Urban', 'Midjil', 'Mohammadabad', 'Moosapet',
    'Nawabpet', 'Rajapur', 'Kookatlapally'
  ],
  'dist-mancherial': [
    'Bellampally', 'Bheemaram', 'Bheemini', 'Chennur', 'Dandepally', 'Hajipur', 'Jaipur', 'Jannaram',
    'Kannepally', 'Kasipet', 'Kotapally', 'Luxettipet', 'Mancherial', 'Mandamarri', 'Naspur', 'Nennal',
    'Tandur', 'Vemanpally'
  ],
  'dist-medak': [
    'Alladurg', 'Chegunta', 'Chilipched', 'Havelighanpur', 'Kowdipalle', 'Kulcharam', 'Manoharabad',
    'Masaipet', 'Medak', 'Narsapur', 'Narsingi', 'Nizampet', 'Papannapet', 'Ramayampet', 'Regode',
    'Shankarampet (A)', 'Shankarampet (R)', 'Shivampet', 'Tekmal', 'Tupran', 'Yeldurthy'
  ],
  'dist-medchal-malkajgiri': [
    'Alwal', 'Bachupally', 'Balanagar', 'Dundigal Gandimaisamma', 'Ghatkesar', 'Kapra', 'Keesara',
    'Kukatpally', 'Malkajgiri', 'Medchal', 'Medipally', 'Muduchintalapalle', 'Quthbullapur',
    'Shamirpet', 'Uppal'
  ],
  'dist-mulugu': [
    'Eturnagaram', 'Govindaraopet', 'Kannaigudem', 'Mangapet', 'Mulug', 'Tadvai', 'Venkatapur',
    'Venkatapuram', 'Wazeed', 'Mallampally'
  ],
  'dist-nagarkurnool': [
    'Achampet', 'Amrabad', 'Balmoor', 'Bijinapalle', 'Charakonda', 'Kalwakurthy', 'Kodair', 'Kollapur',
    'Lingal', 'Nagarkurnool', 'Padara', 'Peddakothapalle', 'Pentlavelli', 'Tadoor', 'Telkapalle',
    'Thimmajipet', 'Uppununthala', 'Urkonda', 'Vangoor', 'Vepangandla'
  ],
  'dist-nalgonda': [
    'Adavidevulapally', 'Anumula (Haliya)', 'Chandampet', 'Chandur', 'Chintha Palle', 'Chityala',
    'Dameracherla', 'Devarakonda', 'Gundlapally', 'Gurrampode', 'Kanagal', 'Kattangoor', 'Kethepally',
    'Kondamallepally', 'Madgulapally', 'Marriguda', 'Miryalaguda', 'Munugode', 'Nakrekal', 'Nalgonda',
    'Narketpally', 'Neredugommu', 'Nidamanoor', 'Pedda Adiserla Pally', 'Peddavoora', 'Saligouraram',
    'Thipparthy', 'Tirumalagiri Sagar', 'Tripuraram', 'Vangamarthy', 'Vemulapally', 'Gattuppal'
  ],
  'dist-narayanpet': [
    'Damaragidda', 'Dhanwada', 'Kosgi', 'Krishna', 'Maddur', 'Maganoor', 'Makthal', 'Marikal',
    'Narayanpet', 'Narva', 'Utkoor', 'Gundumal', 'Kothapalle'
  ],
  'dist-nirmal': [
    'Basar', 'Bhainsa', 'Dasturabad', 'Dilawarpur', 'Kaddam (Peddur)', 'Khanapur', 'Kubeer', 'Kuntala',
    'Laxmanchanda', 'Lokeshwaram', 'Mamada', 'Mudhole', 'Narsapur (G)', 'Nirmal Rural', 'Nirmal Urban',
    'Pembi', 'Sarangapur', 'Soan', 'Tanur'
  ],
  'dist-nizamabad': [
    'Armoor', 'Balkonda', 'Bheemgal', 'Bodhan', 'Chandur', 'Dharpalle', 'Dichpalle', 'Donkeshwar',
    'Edapalle', 'Indalwai', 'Jakranpalle', 'Kammarpalle', 'Kotgiri', 'Kothapalli', 'Makloor', 'Mendora',
    'Mopal', 'Mosra', 'Mugpal', 'Nandipet', 'Navipet', 'Nizamabad North', 'Nizamabad Rural',
    'Nizamabad South', 'Pothangal', 'Renjal', 'Rudrur', 'Salura', 'Sirikonda', 'Varni', 'Velpur',
    'Yedapalle', 'Yerugatla'
  ],
  'dist-peddapalli': [
    'Anthergaon', 'Centenary Colony', 'Dharmaram', 'Eligaid', 'Julapalle', 'Kamanpur', 'Manthani',
    'Mutharam (Manthani)', 'Odela', 'Palakurthy', 'Peddapalli', 'Ramagiri', 'Ramagundam', 'Sulthanabad'
  ],
  'dist-rajanna-sircilla': [
    'Boinpally', 'Chandurthi', 'Ellanthakunta', 'Gambhiraopet', 'Illanthakunta', 'Konaraopet',
    'Musthabad', 'Rudrangi', 'Sircilla', 'Thangallapally', 'Veernapalli', 'Vemulawada', 'Vemulawada Rural'
  ],
  'dist-rangareddy': [
    'Abdullapurmet', 'Amangal', 'Balapur', 'Chevella', 'Chowdergudem', 'Farooqnagar', 'Gandipet',
    'Hayathnagar', 'Ibrahimpatnam', 'Jalpally', 'Kadthal', 'Kandukur', 'Keshampet', 'Kothur', 'Madgul',
    'Maheswaram', 'Manchal', 'Meerpet', 'Moinabad', 'Nandigama', 'Rajendranagar', 'Saroornagar',
    'Serilingampally', 'Shabad', 'Shamshabad', 'Talakondapalle', 'Yacharam', 'Seetharampur'
  ],
  'dist-sangareddy': [
    'Ameenpur', 'Andole', 'Chowtakur', 'Gummadidala', 'Hathnoora', 'Jharasangam', 'Kalher', 'Kandi',
    'Kangti', 'Kohir', 'Kondapur', 'Manoor', 'Mogudampally', 'Munipally', 'Nagalgidda', 'Narayankhed',
    'Nizampet', 'Nyalkal', 'Patancheru', 'Pulkal', 'Raikode', 'Ramachandrapuram', 'Sadasivpet',
    'Sangareddy', 'Sirgapoor', 'Tellapur', 'Vatpally'
  ],
  'dist-siddipet': [
    'Akberpet-Bhoompally', 'Bejjanki', 'Cheriyal', 'Chinnakodur', 'Dhoolmitta', 'Doultabad', 'Gajwel',
    'Husnabad', 'Jagdevpur', 'Koheda', 'Komuravelli', 'Kondapak', 'Koomuravelly', 'Kukunoorpally',
    'Maddur', 'Markook', 'Mirdoddi', 'Mittapally', 'Mulug', 'Nanganur', 'Narayanraopet', 'Raipole',
    'Siddipet (Rural)', 'Siddipet (Urban)', 'Thoguta', 'Wargal'
  ],
  'dist-suryapet': [
    'Ananthagiri', 'Atmakur (S)', 'Chandupatla', 'Chidivada', 'Chilkur', 'Chinthalapalem', 'Chivvemla',
    'Garidepally', 'Huzurnagar', 'Jaggayyapet', 'Kodad', 'Mattampally', 'Mellachervu', 'Mothey',
    'Munagala', 'Nadigudem', 'Neredcherla', 'Nuthankal', 'Palakeedu', 'Penpahad', 'Suryapet',
    'Thirumalagiri', 'Tungaturthi'
  ],
  'dist-vikarabad': [
    'Bantwaram', 'Basheerabad', 'Bomraspeta', 'Chaudharpalle', 'Dharur', 'Doma', 'Doulathabad',
    'Kodangal', 'Kotepally', 'Kulkacherla', 'Marpalle', 'Mominpet', 'Nawabpet', 'Parigi', 'Peddemul',
    'Pudur', 'Tandur', 'Vikarabad', 'Yalal'
  ],
  'dist-wanaparthy': [
    'Amarchinta', 'Atmakur', 'Chinnambavi', 'Ghanpur', 'Gopalpeta', 'Kothakota', 'Madanapur', 'Pangal',
    'Pebbair', 'Peddamandadi', 'Revally', 'Srirangapur', 'Veepangandla', 'Wanaparthy'
  ],
  'dist-warangal': [
    'Chennaraopet', 'Duggondi', 'Fort Warangal', 'Geesugonda', 'Khanapur', 'Nallabelly', 'Narsampet',
    'Nekkonda', 'Parvathagiri', 'Raiparthy', 'Sangem', 'Wardhannapet', 'Warangal (Urban)', 'Kila Warangal'
  ],
  'dist-yadadri-bhuvanagiri': [
    'Addagudur', 'Alair', 'Atmakur (M)', 'Bibinagar', 'Bhongir', 'Boodhan Pochampally', 'Choutuppal',
    'Gundala', 'Motakondur', 'Mothkur', 'Narayanpur', 'Rajapet', 'Ramannapeta', 'Turkapally',
    'Valigonda', 'Vasalamarri', 'Yadagirigutta', 'Bhuvanagiri Rural'
  ]
};

export function buildTelanganaAdministrativeUnits(): Record<string, AdministrativeUnitInfo[]> {
  const result: Record<string, AdministrativeUnitInfo[]> = {};
  for (const [distId, mandals] of Object.entries(TELANGANA_RAW_MANDAL_MAP)) {
    result[distId] = mandals.map(mName => ({
      id: `mandal-${mName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: mName,
      districtId: distId,
      stateId: 'telangana',
      type: 'Mandal'
    }));
  }
  return result;
}
