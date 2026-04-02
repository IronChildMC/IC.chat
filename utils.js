// XOR simple para pruebas
function xorEncrypt(text,key){
  let out='';
  for(let i=0;i<text.length;i++){
    out+=String.fromCharCode(text.charCodeAt(i)^key.charCodeAt(i%key.length));
  }
  return out;
}
function xorDecrypt(text,key){return xorEncrypt(text,key);}

// Genera número aleatorio de 5 dígitos único
function generateRandom5Digit(existingNumbers){
  let num;
  do { num = Math.floor(10000 + Math.random()*90000).toString(); } while(existingNumbers.includes(num));
  return num;
}
