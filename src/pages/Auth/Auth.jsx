import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

import "./style.css";

import firebaseAuth from "../../services/firebaseAuth";

const LogIn = () => {
  const navigator = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    const loginForm = new FormData(e.target);
    let email = loginForm.get("email"),
      password = loginForm.get("password");

    setIsLoading(true);

    await firebaseAuth
      .signInWithAccount(email, password)
      .then((userCredential) => {
        console.log(userCredential);
        toast({
          title: `Hello, ${
            userCredential.user.displayName || userCredential.user.email
          }`,
          description: "Login success!",
        });
        navigator(-1);
      })
      .catch((err) => {
        const errorCode = err.code;
        const errMes = err.message;
        setIsError(true);
        console.log(errorCode, errMes);
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <div className="form-box flex-col login">
      <h1 className="text-4xl italic mb-8">Log In</h1>
      <form
        className="w-[80%] flex flex-col gap-5 absolute top-1/2 -translate-y-1/2"
        onSubmit={handleLogin}
      >
        <div className="control-group">
          <label
            htmlFor="email"
            className="block text-base mb-1 transition-colors"
          >
            Username
          </label>
          <div
            className={`border-b-2 ${
              isError ? "border-red-500" : "border-black"
            } flex items-center`}
          >
            <input
              className="text-base outline-none mr-1 flex-1 p-1 inline-block"
              type="email"
              required
              id="email"
              name="email"
              autoComplete="email"
            />
            <i className="fa-solid fa-user"></i>
          </div>
        </div>
        <div className="control-group">
          <label
            htmlFor="password"
            className="block text-base mb-1 transition-colors"
          >
            Password
          </label>
          <div
            className={`border-b-2 ${
              isError ? "border-red-500" : "border-black"
            } flex items-center`}
          >
            <input
              className="text-base outline-none mr-1 flex-1 p-1 inline-block"
              type="password"
              required
              name="password"
              id="password"
            />
            <i className="fa-solid fa-unlock-keyhole"></i>
          </div>
        </div>
        {isError && (
          <p className="text-sm italic text-red-600">
            <i className="fa-solid fa-circle-exclamation mr-1"></i> Incorrect
            username or password.
          </p>
        )}
        <button className="w-full bg-black text-white text-base py-2 rounded-lg">
          Login
        </button>
      </form>
      {isLoading && <loading />}
    </div>
  );
};

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    const loginForm = new FormData(e.target);
    let email = loginForm.get("email"),
      password = loginForm.get("password"),
      displayName = loginForm.get("displayName");

    setIsLoading(true);

    await firebaseAuth
      .signUpWithAccount(email, password, displayName)
      .then(() => {
        toast({
          title: "Registration Success!",
        });
      })
      .catch((err) => {
        const errorCode = err.code;
        const errMes = err.message;
        setIsError(true);
        console.log(errorCode, errMes);
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <div className="form-box flex-col register">
      <h1 className="text-4xl italic">Sign Up</h1>
      <form
        className="flex flex-col gap-5 w-[80%] absolute top-1/2 -translate-y-1/2"
        onSubmit={handleLogin}
      >
        <div className="control-group">
          <label
            htmlFor="email"
            className="block text-base mb-1 transition-colors"
          >
            Username
          </label>
          <div
            className={`border-b-2 ${
              isError ? "border-red-500" : "border-black"
            } flex items-center`}
          >
            <input
              className="text-base outline-none mr-1 flex-1 p-1 inline-block"
              type="email"
              required
              id="email"
              name="email"
              autoComplete="email"
            />
            <i className="fa-solid fa-user"></i>
          </div>
        </div>
        <div className="control-group">
          <label
            htmlFor="password"
            className="block text-base mb-1 transition-colors"
          >
            Password
          </label>
          <div
            className={`border-b-2 ${
              isError ? "border-red-500" : "border-black"
            } flex items-center`}
          >
            <input
              className="text-base outline-none mr-1 flex-1 p-1 inline-block"
              type="password"
              required
              name="password"
              id="password"
            />
            <i className="fa-solid fa-unlock-keyhole"></i>
          </div>
        </div>
        <div className="control-group">
          <label
            htmlFor="displayName"
            className="block text-base mb-1 transition-colors"
          >
            Display Name
          </label>
          <div
            className={`border-b-2 ${
              isError ? "border-red-500" : "border-black"
            } flex items-center`}
          >
            <input
              className="text-base outline-none mr-1 flex-1 p-1 inline-block"
              type="text"
              required
              name="displayName"
              id="displayName"
            />
            <i className="fa-solid fa-unlock-keyhole"></i>
          </div>
        </div>

        {/* {isError && (
          <p className="text-sm italic text-red-600">
            <i className="fa-solid fa-circle-exclamation mr-1"></i> Incorrect
            username or password.
          </p>
        )} */}
        <button className="w-full bg-black text-white text-base py-2 rounded-lg">
          Sign Up
        </button>
      </form>
      {isLoading && <loading />}
    </div>
  );
};

const Auth = () => {
  const navigator = useNavigate();

  useEffect(() => {
    if (firebaseAuth.auth.currentUser) {
      navigator(-1);
    }
  });

  const [loginPage, SetLoginPage] = useState(true);

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 bg-black/70 flex justify-center items-center">
      <div className={`container ${!loginPage ? "active" : ""}`}>
        <LogIn />
        <SignUp />

        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <h1 className="leading-9 mb-2 text-4xl">
              Welcome back! <br />
              <p className="text-base text-center my-4 italic">
                Login to use powerful features
              </p>
            </h1>
            <p className="mb-3">Don&apos;t have an account?</p>
            <button
              className="btn register-btn"
              onClick={() => SetLoginPage(false)}
            >
              Sign Up
            </button>
          </div>

          <div className="toggle-panel toggle-right">
            <h1 className="text-4xl">Welcome to NTE!</h1>
            <p className="mb-4 mt-3">Already have an account?</p>
            <button
              className="btn login-btn"
              onClick={() => SetLoginPage(true)}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
