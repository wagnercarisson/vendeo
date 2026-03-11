const fs = require("fs");
const code = fs.readFileSync('g:\\Projetos\\vendeo\\app\\dashboard\\campaigns\\[id]\\_components\\CampaignPreviewClient.tsx', 'utf8');

let tags = [];
let re = /<\/?([a-zA-Z]+)(?![a-zA-Z0-9_-])[^>]*>/g;
let match;
const selfClosing = ['img', 'input', 'br', 'hr', 'ArrowLeft', 'Sparkles', 'Wand2', 'Check', 'Copy', 'Upload', 'Loader2', 'ImageIcon', 'Video', 'Field', 'Empty', 'CampaignArtViewer', 'Image'];

while ((match = re.exec(code)) !== null) {
  const full = match[0];
  const isClosing = full.startsWith('</');
  const tag = match[1];
  const isSelfClosing = full.endsWith('/>') || selfClosing.includes(tag);

  if (tag !== 'div' && tag !== 'Card' && tag !== 'section') continue;

  if (isSelfClosing) continue;

  if (isClosing) {
    if (tags.length > 0 && tags[tags.length - 1] === tag) {
      tags.pop();
    } else {
      tags.push("MISMATCH: " + full);
    }
  } else {
    tags.push(tag);
  }
}
fs.writeFileSync('g:\\Projetos\\vendeo\\tags.txt', JSON.stringify(tags, null, 2));
