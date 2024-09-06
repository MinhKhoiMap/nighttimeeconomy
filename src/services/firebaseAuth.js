import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import FirebaseApp from "./firebaseApp";

class FirebaseAuth extends FirebaseApp {
  provider;
  auth;

  constructor() {
    super();
    this.provider = new GoogleAuthProvider();
    this.provider.addScope("https://www.googleapis.com/auth/contacts.readonly");
    this.auth = getAuth();
    this.auth.useDeviceLanguage();
  }

  // signInWithGoogle = () => {
  //   signInWithPopup(this.auth, this.provider)
  //     .then((result) => {
  //       const credential = GoogleAuthProvider.credentialFromResult(result);
  //       const token = credential.accessToken;

  //       const user = result.user;
  //     })
  //     .catch((err) => {
  //       const errorCode = err.code;
  //       const errMes = err.message;
  //       const credential = GoogleAuthProvider.credentialFromError(err);
  //       console.log(credential, errorCode, errMes);
  //     });
  // };

  signInWithAccount = async (username, password) => {
    console.log(username, password);
    return signInWithEmailAndPassword(this.auth, username, password).catch(
      (err) => {
        const errorCode = err.code;
        const errMes = err.message;
        console.log(errorCode, errMes);
      }
    );
  };

  signOut = async () => {
    return signOut(this.auth).catch((err) => console.log(err));
  };
}

export default new FirebaseAuth();
