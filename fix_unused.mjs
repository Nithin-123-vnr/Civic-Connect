import fs from 'fs';

function fixFile(file, unusedName) {
  let content = fs.readFileSync(file, 'utf8');
  const regex = new RegExp(`\\s*${unusedName},?`, 'g');
  content = content.replace(regex, '');
  fs.writeFileSync(file, content);
}

fixFile('src/screens/district/DistrictDashboardScreen.tsx', 'MOCK_DISTRICT_OFFICER');
fixFile('src/screens/mandal/MandalDashboardScreen.tsx', 'MOCK_MANDAL_OFFICER');
fixFile('src/screens/state/StateAdminDashboardScreen.tsx', 'MOCK_STATE_ADMIN');

console.log('Unused mock references removed');
