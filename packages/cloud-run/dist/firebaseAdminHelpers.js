"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileNameToFirestore = exports.uploadFileToStorage = void 0;
const storage_1 = require("@google-cloud/storage");
const firebaseAdminInit_js_1 = __importDefault(require("./shared/firebaseAdminInit.js"));
const uploadFileToStorage = (localFilePath, remoteFilePath) => {
    const storage = new storage_1.Storage();
    return storage.bucket('toolproof-yellowpapers').upload(localFilePath, { destination: remoteFilePath });
};
exports.uploadFileToStorage = uploadFileToStorage;
const uploadFileNameToFirestore = (fileName) => {
    const fileRef = firebaseAdminInit_js_1.default.collection('files').doc(fileName);
    return fileRef.set({ fileName });
};
exports.uploadFileNameToFirestore = uploadFileNameToFirestore;
