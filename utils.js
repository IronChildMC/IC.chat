// AES Encrypt/Decrypt
function encryptAES(text,key){
    return CryptoJS.AES.encrypt(text,key).toString();
}
function decryptAES(ciphertext,key){
    return CryptoJS.AES.decrypt(ciphertext,key).toString(CryptoJS.enc.Utf8);
}

// Número aleatorio 5 dígitos único
function generateRandom5Digit(existingNumbers){
  let num;
  do { num = Math.floor(10000 + Math.random()*90000).toString(); } while(existingNumbers.includes(num));
  return num;
}
