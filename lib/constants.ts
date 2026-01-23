import { Hub, HubLocation, ShipmentMode } from '../types';

export const HUBS: Record<HubLocation, Hub & { uuid: string }> = {
  IMPHAL: {
    id: 'IMPHAL',
    name: 'Imphal Hub',
    code: 'IMF',
    address: 'Tulihal Airport Road, Imphal, Manipur 795001',
    sortCode: 'SUR',
    uuid: '00000000-0000-0000-0000-000000000010',
  },
  NEW_DELHI: {
    id: 'NEW_DELHI',
    name: 'New Delhi Hub',
    code: 'DEL',
    address: 'Cargo Terminal 3, IGI Airport, New Delhi 110037',
    sortCode: 'GAUA',
    uuid: '00000000-0000-0000-0000-000000000011',
  },
};

export const SHIPMENT_MODES: { id: ShipmentMode; label: string }[] = [
  { id: 'AIR', label: 'Air Cargo' },
  { id: 'TRUCK', label: 'Truck Linehaul' },
];

export const SERVICE_LEVELS = [
  {
    id: 'STANDARD',
    label: 'Standard (3-5 Days)',
    code: 'STD',
    description: 'Regular delivery service',
  },
  { id: 'EXPRESS', label: 'Express (1-2 Days)', code: 'EXP', description: 'Fast delivery service' },
  {
    id: 'PRIORITY',
    label: 'Priority (Same Day)',
    code: 'PRI',
    description: 'Urgent same-day delivery',
  },
];

export const PAYMENT_MODES = [
  { id: 'PAID', label: 'Paid (Prepaid)' },
  { id: 'TO_PAY', label: 'To Pay (Collect)' },
  { id: 'TBB', label: 'TBB (To Be Billed)' },
];

export const INDIAN_STATES = [
  'Manipur',
  'Delhi', // Priority States
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep',
  'Puducherry',
  'Ladakh',
  'Jammu and Kashmir',
];

export const POPULAR_CITIES = [
  'Imphal',
  'New Delhi',
  'Guwahati',
  'Dimapur',
  'Kohima',
  'Aizawl',
  'Shillong',
  'Agartala',
  'Kolkata',
  'Mumbai',
  'Bangalore',
  'Chennai',
  'Hyderabad',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Churachandpur',
  'Thoubal',
  'Kakching',
  'Senapati',
  'Ukhrul',
  'Bishnupur',
];

export const CONTENT_TYPES = [
  'Personal Effects',
  'Documents',
  'Electronics',
  'Clothing/Garments',
  'Auto Parts',
  'Medicines/Pharma',
  'Perishables (Dry)',
  'Household Goods',
  'Books/Stationery',
  'Handicrafts',
  'Machinery Parts',
  'Sports Goods',
];
