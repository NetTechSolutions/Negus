const fs = require('fs');
const files = ['index.html', 'about.html', 'projects.html', 'contact.html', 'src/main.js'];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  // Replace absolute links like href="/about.html" with href="./about.html"
  content = content.replace(/href="\//g, 'href="./');
  // Replace href="./" (which was href="/") with href="./index.html"
  content = content.replace(/href="\.\/"/g, 'href="./index.html"');
  fs.writeFileSync(f, content);
  console.log('Fixed links in', f);
});
