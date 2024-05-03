import mapboxgl from "mapbox-gl";
import { Map } from "react-map-gl";
import { useRef, useContext, useCallback, useState, useEffect } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { initialViewState } from "./contexts/initialViewContext";

// Import utils
import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";

// Import components
import HomePage from "./pages/HomePage/HomePage";
import SiteSelection from "./pages/SiteSelection/SiteSelection";
import Details from "./pages/Details/Details";
import Test from "./pages/Test/Test";

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
  const [windowHeight, setWindowHeight] = useState(null);

  const spinGlobe = () => {
    const zoom = map.current.getMap().getZoom();

    if (!userInteract && zoom < maxSpinZoom) {
      let distancePerSecond = 360 / secondsPerRevolution;
      if (zoom > slowSpinZoom) {
        // Slow spinning at higher zooms
        const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
        distancePerSecond *= zoomDif;
      }
      const center = map.current.getMap().getCenter();
      center.lng += distancePerSecond;

      // Smoothly animate the map over one second.
      // When this animation is complete, it calls a 'moveend' event.
      map.current.easeTo({
        center,
        duration: 1000,
        easing: (n) => n,
      });
    }
  };

  useEffect(() => {
    window.onresize = () => {
      setWindowHeight(window.innerHeight);
    };

    return () => {
      window.onresize = null;
    };
  }, []);

  useEffect(() => {
    if (map.current) spinGlobe();
  }, [userInteract]);

  // useEffect(() => {
  //   map.current?.getMap().on("resize", () => {
  //     map.current.setZoom(windowHeight * (2 / 742));
  //     console.log("first");
  //   });

  //   return () => map.current?.getMap().off("resize");
  // }, [windowHeight]);

  return (
    <div className="w-screen h-screen relative">
      <Map
        id="map"
        ref={map}
        mapboxAccessToken={mapboxgl.accessToken}
        initialViewState={initialView}
        projection="globe"
        onLoad={spinGlobe}
        onMoveEnd={spinGlobe}
        onMouseDown={() => {
          setUserInteract(true);
          spinGlobe();
        }}
        onMouseUp={() => {
          setTimeout(() => {
            spinGlobe();
            setUserInteract(false);
          }, 500);
        }}
        onDragEnd={() => {
          setTimeout(() => {
            spinGlobe();
            setUserInteract(false);
          }, 500);
        }}
        logoPosition="bottom-left"
        mapStyle="mapbox://styles/mapbox/dark-v11"
        attributionControl={false}
        // trackResize={true}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/nha_trang" element={<SiteSelection />}>
            <Route path="/nha_trang/:site" element={<Details />} />
          </Route>
          <Route path="/about_project" element={<Test />} />
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
