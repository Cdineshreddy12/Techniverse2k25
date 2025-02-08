import CryptoJS from 'crypto-js';
import { hdfcConfig } from '../config/hdfc.js';

export const encryptData = (data) => {
  const keyHex = CryptoJS.enc.Utf8.parse(hdfcConfig.workingKey);
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), keyHex, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
};

export const decryptData = (encryptedData) => {
  const keyHex = CryptoJS.enc.Utf8.parse(hdfcConfig.workingKey);
  const decrypted = CryptoJS.AES.decrypt(encryptedData, keyHex, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
};