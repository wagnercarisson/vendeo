const fs = require("fs");
const code = fs.readFileSync('g:\\Projetos\\vendeo\\app\\dashboard\\campaigns\\[id]\\_components\\CampaignPreviewClient.tsx', 'utf8');

const returnStart = code.indexOf('return (');
const relevantCode = code.substring(returnStart);

let stack = [];
let re = /<\/?([a-zA-Z]+)(?![a-zA-Z0-9_-])[^>]*>/g;
let match;
const selfClosing = ['img', 'input', 'br', 'hr', 'ArrowLeft', 'Sparkles', 'Wand2', 'Check', 'Copy', 'Upload', 'Loader2', 'ImageIcon', 'Video', 'Field', 'Empty', 'CampaignArtViewer', 'Image'];

while ((match = re.exec(relevantCode)) !== null) {
  const full = match[0];
  const isClosing = full.startsWith('</');
  const tag = match[1];

  if (full.endsWith('/>') || selfClosing.includes(tag)) continue;
  if (!['div', 'Card', 'section', 'button', 'p', 'h3', 'h2', 'span', 'strong', 'Link'].includes(tag)) continue;

  if (isClosing) {
    if (stack.length > 0 && stack[stack.length - 1].tag === tag) {
      stack.pop();
    } else {
      console.log(`MISMATCH AT LINE: ${relevantCode.substring(0, match.index).split('\\n').length} - EXPECTED ${stack[stack.length - 1]?.tag} BUT GOT ${full}`);
      break;
    }
  } else {
    stack.push({tag, line: relevantCode.substring(0, match.index).split('\\n').length, match: full});
  }
}

if (stack.length > 0) {
    console.log("UNCLOSED TAGS:", stack);
} else {
    console.log("ALL TAGS MATCH PERFECTLY!");
}
