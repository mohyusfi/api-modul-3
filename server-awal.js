const http = require('http');

const server = http.createServer((req, res) => {
  console.log(req.method, req.url);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Halo dari server Node.js pertama saya');
});

server.listen(3000, () => {
  console.log('1. Moh. Yusfi Lakhafidun F5512520089')
  console.log('2. Nefaldi F5512520082')
  console.log('3. Alfias F5512520099')
  console.log('4. Akshan Maulan Rahim F5512530114')
  console.log('5. Ilham Arifin F5512530119')
  console.log('Server berjalan di http://localhost:3000');
});