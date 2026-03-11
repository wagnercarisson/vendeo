const fs = require('fs');
const path = require('path');

function replaceZincWithSlate(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      replaceZincWithSlate(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('zinc')) {
        content = content.replace(/zinc/g, 'slate');
        fs.writeFileSync(fullPath, content);
        console.log(`Replaced in ${fullPath}`);
      }
    }
  }
}

replaceZincWithSlate('g:/Projetos/vendeo/app/dashboard/campaigns/new');
console.log('Finished replacing zinc with slate in new campaign components.');
