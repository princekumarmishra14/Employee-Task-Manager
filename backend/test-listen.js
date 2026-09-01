
const http = require('http');
const dotenv = require('dotenv');
dotenv.config();
const PORT = process.env.PORT || 5000;
const server = http.createServer().listen(PORT, () => {
  console.log('Test listening on', PORT);
});
server.on('error', (err) => console.log('ERROR:', err));
server.on('close', () => console.log('CLOSED'));

