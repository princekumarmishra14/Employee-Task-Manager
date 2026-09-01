
const http = require('http');
const dotenv = require('dotenv');
dotenv.config();
const PORT = process.env.PORT || 5000;
const server = http.createServer().listen(PORT, () => {
  console.log('Test listening on', server.address());
});
server.on('error', (err) => console.log('ERROR:', err));

