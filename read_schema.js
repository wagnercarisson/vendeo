const fs = require('fs');
const content = fs.readFileSync('g:\\Projetos\\vendeo\\database\\schema.sql', 'utf16le');
const match = content.match(/CREATE TABLE public\.campaigns \((.*?)\);/s);
if (match) {
    console.log(match[1]);
} else {
    // try fallback 
    const fallbackMatch = content.match(/CREATE TABLE public\.campaigns([\s\S]*?)CREATE TABLE/);
    if (fallbackMatch) console.log(fallbackMatch[1]);
    else console.log(content.substring(0, 1000));
}
