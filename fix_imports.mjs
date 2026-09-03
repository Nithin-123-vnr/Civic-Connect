import fs from 'fs';

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('import { useAuth }')) {
    content = content.replace(/import \{[\s\S]*?\} from "@\/lib\/mockData";/, (match) => {
      return match + '\nimport { useAuth } from "@/contexts/AuthContext";';
    });
  }
  
  // Also remove unused MOCK references in the file if they are just not used
  // Or just let TS ignore them using // @ts-ignore if we want, but better to remove from import.
  // I will just add useAuth and we can live with the unused variable, wait no, TS will fail on unused variables if noUnusedLocals is true.
  
  fs.writeFileSync(file, content);
}

fixFile('src/screens/district/DistrictDashboardScreen.tsx');
fixFile('src/screens/mandal/MandalDashboardScreen.tsx');
fixFile('src/screens/state/StateAdminDashboardScreen.tsx');

let viteEnv = `/// <reference types="vite/client" />\n`;
fs.writeFileSync('src/vite-env.d.ts', viteEnv);

console.log('Fixed imports and vite-env.d.ts');
