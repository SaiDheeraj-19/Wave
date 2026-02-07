
import CryptoJS from 'crypto-js';

const DES_KEY = "38346591";
const encryptedUrl = "ID2ieOjCrwfgWvL5sXl4B1ImC5QfbsDy6UWMvucrWHxfIRjtvw8g35/f89z5MoGc71/Y9eRN3bK0jKAAHF631xw7tS9a8Gtq";

const decrypt = (encryptedMediaUrl) => {
    const encrypted = CryptoJS.enc.Base64.parse(encryptedMediaUrl);
    const key = CryptoJS.enc.Utf8.parse(DES_KEY);

    const decrypted = CryptoJS.DES.decrypt(
        { ciphertext: encrypted },
        key,
        {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
};

console.log("Decrypted:", decrypt(encryptedUrl));
