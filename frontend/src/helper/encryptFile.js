import NodeRSA from "node-rsa";

// Assuming you have the Flask API's public key loaded
const publicKey = import.meta.env.VITE_RSA_KEY;
console.log(publicKey);

// Create RSA instance with the public key
const rsa = new NodeRSA();
rsa.importKey(publicKey, "pkcs8-public");

export default function encryptionFile(fileData) {
  const encryptedData = rsa.encrypt(fileData, "base64");
  console.log(encryptedData);

  return encryptedData;
}

encryptionFile();
