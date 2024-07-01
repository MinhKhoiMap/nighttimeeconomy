import mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useState } from "react";
import * as turf from "@turf/turf";
const Test = () => {
  function handleClientLoad() {
    gapi.load("client", initClient);
  }

  function initClient() {
    gapi.client
      .init({
        apiKey: "AIzaSyCfPQga7wI-DP8UQe-OQOh2PIzClVuw_fk",
        clientId:
          "114248140081-nfm2bfuodr3tae7pbt10hbjchtvgkok1.apps.googleusercontent.com",
        discoveryDocs: ["https://people.googleapis.com/$discovery/rest"],
        scope: "https://www.googleapis.com/auth/drive",
      })
      .then(() => console.log("first"));
  }
  return (
    <>
      <div
        onClick={handleClientLoad}
        className="fixed z-[99999] text-white text-[20px]"
      >
        Click here
      </div>
    </>
  );
};

export default Test;
