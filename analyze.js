const fs = require('fs');
const path = require('path');
const collections = new Set();
function search(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory() && f !== 'node_modules' && f !== '.next') {
      search(p);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      const text = fs.readFileSync(p, 'utf8');
      const m = text.match(/collection\(db,\s*['"]([^'"]+)['"]/g);
      if (m) {
        m.forEach(x => collections.add(x.split(/['"]/)[1]));
      }
    }
  }
}
search('src');
console.log(Array.from(collections));
