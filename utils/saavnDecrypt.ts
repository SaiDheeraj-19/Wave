
import CryptoJS from 'crypto-js';

const DES_KEY = "38346591"; // Standard Saavn Decryption Key

export const decryptUrl = (encryptedMediaUrl: string): string => {
    if (!encryptedMediaUrl) return '';

    const encrypted = CryptoJS.enc.Base64.parse(encryptedMediaUrl);
    const key = CryptoJS.enc.Utf8.parse(DES_KEY);

    const decrypted = CryptoJS.DES.decrypt(
        CryptoJS.lib.CipherParams.create({ ciphertext: encrypted }),
        key,
        {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        }
    );

    const raw = decrypted.toString(CryptoJS.enc.Utf8);
    if (!raw) return '';

    return raw.replace(/_96\.mp4$/, '_320.mp4');
};
