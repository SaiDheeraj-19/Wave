
import CryptoJS from 'crypto-js';

const DES_KEY = "38346591"; // Standard Saavn Decryption Key

export const decryptUrl = (encryptedMediaUrl: string): string => {
    if (!encryptedMediaUrl) return '';

    try {
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

        // Handle both .mp4 and .m4a extensions and prefer 320kbps
        return raw.replace(/_96\.(mp4|m4a)$/, '_320.$1').replace(/_160\.(mp4|m4a)$/, '_320.$1');
    } catch (e) {
        console.error("Decryption failed", e);
        return '';
    }
};
