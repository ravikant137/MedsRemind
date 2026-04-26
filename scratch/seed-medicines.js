const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../client/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const medicines = [
  {
    name: "Paracetamol 500mg",
    composition: "Paracetamol",
    price: 45,
    stock: 100,
    category: "Fever",
    description: "Commonly used for fever and mild to moderate pain."
  },
  {
    name: "Amoxicillin 250mg",
    composition: "Amoxicillin",
    price: 120,
    stock: 50,
    category: "Antibiotic",
    description: "Used to treat various bacterial infections."
  },
  {
    name: "Cetirizine 10mg",
    composition: "Cetirizine",
    price: 35,
    stock: 80,
    category: "Allergy",
    description: "Antihistamine used to relieve allergy symptoms."
  }
];

async function seed() {
  console.log('Seeding medicines...');
  const { data, error } = await supabase
    .from('medicines')
    .insert(medicines);

  if (error) {
    console.error('Error seeding medicines:', error);
  } else {
    console.log('Medicines seeded successfully!');
  }
}

seed();
