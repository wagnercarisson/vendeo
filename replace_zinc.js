const fs = require('fs');
const file = 'g:/Projetos/vendeo/app/dashboard/store/page.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/zinc/g, 'slate');
fs.writeFileSync(file, content);
console.log('Replaced zinc with slate');
