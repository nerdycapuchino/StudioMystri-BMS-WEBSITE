const fs = require('fs');
let code = fs.readFileSync('prisma/seed.ts', 'utf8');
code = code.replace(/cost: (\d+),\s*stock: (\d+),/g, 'cost: $1, stockQuantity: $2,');
fs.writeFileSync('prisma/seed.ts', code);
console.log('Fixed stock -> stockQuantity in seed.ts');
