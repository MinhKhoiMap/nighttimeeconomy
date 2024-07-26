import mapboxgl from "mapbox-gl";
import { Map } from "react-map-gl";
import { useRef, useContext, useState, useEffect } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { initialViewState } from "./contexts/initialViewContext";
import "./utils/folderDriveList";

// Import utils
import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";
import generateActivities from "./utils/generateTiming";

// Import components
import HomePage from "./pages/HomePage/HomePage";
import SiteSelection from "./pages/SiteSelection/SiteSelection";
import Details from "./pages/Details/Details";
import Test from "./pages/Test/Test";
import AboutProject from "./pages/AboutProject/AboutProject";

mapboxgl.accessToken =
  "pk.eyJ1IjoiaGVsbG9pYW1raG9pIiwiYSI6ImNscWtoODB0MzIyeTEybm1rc2l1YWg0bm8ifQ.wOn1q83oPkWNJBap0KFrWQ";

function App() {
  const initialView = useContext(initialViewState);
  const map = useRef(null);
  const secondsPerRevolution = 120;
  // Above zoom level 5, do not rotate.
  const maxSpinZoom = 5;
  // Rotate at intermediate speeds between zoom levels 3 and 5.
  const slowSpinZoom = 3;

  const [userInteract, setUserInteract] = useState(false);

  // This function handle rotate the globe
  const spinGlobe = () => {
    const zoom = map.current.getMap().getZoom();

    // When client interact with the globe, userInteract is changed to true and the globe does not rotate
    if (!userInteract && zoom < maxSpinZoom) {
      let distancePerSecond = 360 / secondsPerRevolution;
      if (zoom > slowSpinZoom) {
        // Slow spinning at higher zooms
        const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
        distancePerSecond *= zoomDif;
      }
      const center = map.current.getMap().getCenter();
      let newCenter = {
        lng: center.lng + distancePerSecond,
        lat: center.lat + distancePerSecond,
      };

      // Smoothly animate the map over one second.
      // When this animation is complete, it calls a 'moveend' event.
      map.current.easeTo({
        center: [newCenter.lng, newCenter.lat],
        duration: 1000,
        easing: (n) => n,
      });
    }
  };

  // When userInteract state is changed, this function is called
  useEffect(() => {
    if (map.current) spinGlobe();
  }, [userInteract]);

  return (
    <div className="w-screen h-screen relative">
      <Map
        id="map"
        ref={map}
        mapboxAccessToken={mapboxgl.accessToken}
        initialViewState={initialView}
        projection="globe"
        // When the map finishes loading, rotate the globe
        onLoad={spinGlobe}
        // on all events below, set userInteract to true
        // start
        onMoveEnd={spinGlobe}
        onMouseDown={() => setUserInteract(true)}
        onDragEnd={() => {
          setTimeout(() => {
            setUserInteract(false);
          }, 500);
        }}
        // end
        // on mouse up event, client don't interact with the globe so userInteract is changed to false
        onMouseUp={() => {
          setTimeout(() => {
            setUserInteract(false);
          }, 500);
        }}
        logoPosition="bottom-left"
        mapStyle="mapbox://styles/helloiamkhoi/cly8gmp0m00hh01qv5i4wgvmv"
        attributionControl={false}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/nha_trang" element={<SiteSelection />}>
            {/* This childer route decide children component which will be mounted
            in SiteSelection parent component */}
            <Route path="/nha_trang/:site" element={<Details />} />
          </Route>
          <Route path="/about_project" element={<AboutProject />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </Map>
      <div className="fixed bottom-2 right-[25px] about-project__container">
        <Link className="text-white mt-5 block" to="/about_project">
          <span className="inline-block">About Project</span>
        </Link>
      </div>
    </div>
  );
}

export default App;
