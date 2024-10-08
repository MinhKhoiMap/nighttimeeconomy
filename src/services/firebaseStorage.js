import {
  getStorage,
  ref,
  listAll,
  getDownloadURL,
  getMetadata,
  uploadString,
  list,
} from "firebase/storage";
import firebaseApp from "./firebaseApp";

const app = firebaseApp.registerApp;
const storage = getStorage(app);

function getRef(path) {
  return ref(storage, path);
}

async function listChilds(folderRef) {
  try {
    const response = await listAll(folderRef);
    return response.items;
  } catch (err) {
    console.log("Err at listChilds", err);
  }
}

async function getDownloadUrl(fileRef) {
  try {
    return await getDownloadURL(fileRef);
  } catch (err) {
    console.log(err, "err at getDownloadUrl");
  }
}

async function getMeta(fileRef) {
  try {
    return await getMetadata(fileRef);
  } catch (err) {
    console.log(err, "err at getMetadata");
  }
}

async function updloadScenario(fileName, scenario) {
  try {
    const fileRef = ref(storage, fileName);
    let data = JSON.stringify(scenario);
    return await uploadString(fileRef, data);
  } catch (error) {
    console.log(error);
  }
}

async function listChild(folderPath) {
  try {
    const folderRef = ref(storage, folderPath);
    return await listAll(folderRef);
  } catch (err) {
    console.log("Err at listChild", err);
  }
}

export {
  app,
  storage,
  getRef,
  getDownloadUrl,
  getMeta,
  listChilds,
  listChild,
  updloadScenario,
};
