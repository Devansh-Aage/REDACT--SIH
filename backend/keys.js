const NodeRSA = require('node-rsa');

// Generate a new RSA key pair
const key = new NodeRSA({ b: 2048 });

// Export the private key (not recommended for frontend, just for demonstration)
const privateKey = key.exportKey('private');

// Export the public key
const publicKey = key.exportKey('public');

console.log('Public Key:', publicKey);
console.log('Private Key:', privateKey);

// Optionally save the keys in a secure place or use the public key in the frontend
