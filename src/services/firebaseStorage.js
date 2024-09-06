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

const firebaseConfig = {
  apiKey: "AIzaSyCXtIfrOkcg0Te-mY8t8KkrwxlZ0aqKPF0",
  authDomain: "night-time-economy-c0a4e.firebaseapp.com",
  projectId: "night-time-economy-c0a4e",
  storageBucket: "gs://night-time-economy-c0a4e.appspot.com",
  messagingSenderId: "940436623314",
  appId: "1:940436623314:web:24c3c975580ad499fb020b",
};

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
  const fileRef = ref(storage, fileName);
  let data = JSON.stringify(scenario);
  return uploadString(fileRef, data).catch((err) => console.log(err));
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
