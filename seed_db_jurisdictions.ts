import { supabase } from './src/lib/supabase';
import { INDIA_JURISDICTION_DATA } from './src/data/jurisdictions/indiaData';
import { TELANGANA_DISTRICTS, TELANGANA_RAW_MANDAL_MAP } from './src/data/jurisdictions/telanganaData';

async function seedJurisdictions() {
  console.log("Seeding states...");
  const statesPayload = INDIA_JURISDICTION_DATA.states.map(s => ({
    id: s.id,
    name: s.name,
    code: s.code,
    type: s.type,
    administrative_unit_type: s.administrativeUnitType
  }));

  const { error: stateErr } = await supabase.from('states').upsert(statesPayload, { onConflict: 'id' });
  if (stateErr) console.error("Error seeding states:", stateErr);
  else console.log(`Seeded ${statesPayload.length} States & UTs successfully.`);

  console.log("Seeding Telangana 33 districts...");
  const distPayload = TELANGANA_DISTRICTS.map(d => ({
    id: d.id,
    state_id: d.stateId,
    name: d.name,
    code: d.stateCode
  }));

  const { error: distErr } = await supabase.from('districts').upsert(distPayload, { onConflict: 'id' });
  if (distErr) console.error("Error seeding districts:", distErr);
  else console.log(`Seeded ${distPayload.length} Districts successfully.`);

  console.log("Seeding 612 Telangana Mandals...");
  const mandalsPayload: any[] = [];
  for (const [distId, mandalNames] of Object.entries(TELANGANA_RAW_MANDAL_MAP)) {
    for (const mName of mandalNames) {
      mandalsPayload.push({
        id: `mandal-${distId.replace('dist-', '')}-${mName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        district_id: distId,
        state_id: 'telangana',
        name: mName,
        type: 'Mandal'
      });
    }
  }

  // Insert in batches of 100
  for (let i = 0; i < mandalsPayload.length; i += 100) {
    const chunk = mandalsPayload.slice(i, i + 100);
    const { error: mErr } = await supabase.from('administrative_units').upsert(chunk, { onConflict: 'id' });
    if (mErr) console.error(`Error seeding mandals chunk ${i}:`, mErr);
  }
  console.log(`Seeded ${mandalsPayload.length} Administrative Units (Mandals) successfully.`);
}

seedJurisdictions();
