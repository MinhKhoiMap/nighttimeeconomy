import { initializeApp } from "firebase/app";

const firbaseConfig = {
  apiKey: "AIzaSyCXtIfrOkcg0Te-mY8t8KkrwxlZ0aqKPF0",
  authDomain: "night-time-economy-c0a4e.firebaseapp.com",
  projectId: "night-time-economy-c0a4e",
  storageBucket: "gs://night-time-economy-c0a4e.appspot.com",
  messagingSenderId: "940436623314",
  appId: "1:940436623314:web:24c3c975580ad499fb020b",
};

class FirebaseApp {
  static registerApp;
  constructor() {
    this.registerApp = initializeApp(firbaseConfig);
  }
}

export default FirebaseApp;
