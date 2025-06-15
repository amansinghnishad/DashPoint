const fs = require('fs');
const path = require('path');

const files = [
  'src/controllers/todoController.js',
  'src/controllers/stickyNoteController.js'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/req\.user\.id/g, 'req.user._id');
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});

console.log('Done!');
