import { useCallback, useEffect, useState } from "react";
import { Layer, Marker, Source, useMap } from "react-map-gl";
import { Outlet, useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";

import "./SiteSelection.css";

import { siteSelectionData } from "../../assets/data/site";
import Button from "../../components/Button/Button";

const SiteSelection = () => {
  // this is represents the selected area index
  const [siteChosenIndex, setSiteChosenIndex] = useState(null);

  const navigate = useNavigate();

  const { map } = useMap();

  useEffect(() => {
    handleLoadSite();

    // map.getMap().on("flystart", () => {
    //   flying = true;
    // });

    // map.getMap().on("flyend", () => {
    //   flying = false;
    // });

    // map.getMap().once("moveend", () => {
    //   if (flying) {
    //     setIsShowMarker(true);
    //     map.getMap().fire("flyend");
    //   }
    // });
  }, [map]);

  // Handling to display all areas in a viewport
  const handleLoadSite = useCallback(() => {
    var bounds = new mapboxgl.LngLatBounds();

    // Loop through all areas and extend bounds box
    siteSelectionData.features.forEach((feature) => {
      feature.geometry.coordinates[0].forEach((coordinate) =>
        bounds.extend(coordinate)
      );
    });

    map.fitBounds(bounds, {
      padding: { top: 20, bottom: 20, left: 20, right: 20 },
      duration: 3000,
    });
  }, [map]);

  // Set event listeners to each layer
  const siteLayerHandler = useCallback(
    (name, feature, id) => {
      // Set click envet listener to layer with id fill_{name}
      // Structure function: map.on({event name}, {layer id}, {callback function})
      map.on("click", `fill_${name}`, (e) => {
        setSiteChosenIndex(id);
        navigate(`./${id}`);
      });

      map.on("mouseover", `fill_${name}`, (e) => {
        map.getMap().doubleClickZoom.disable();
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", `fill_${name}`, (e) => {
        map.getMap().doubleClickZoom.enable();
        map.getCanvas().style.cursor = "grab";
      });

      map.on("dragstart", `fill_${name}`, (e) => {
        map.getCanvas().style.cursor = "grab";
      });
    },
    [map]
  );

  return (
    <>
      {siteSelectionData.features.map((feature, index) => {
        let name = `site_${feature.name}`;

        // When layer is finished drawing, the function above will be set to this layer
        useEffect(() => {
          siteLayerHandler(name, feature, index);

          return () => {
            map.off("click", `fill_${name}`);
            map.off("mouseenter", `fill_${name}`);
            map.off("mouseleave", `fill_${name}`);
            map.off("dragstart", `fill_${name}`);
            map.off("dragend", `fill_${name}`);
          };
        }, []);

        return (
          <Source key={name} id={name} type="geojson" data={feature.geometry}>
            <Layer
              type="line"
              paint={{
                "line-color": "#fff",
                "line-width": 0.4,
              }}
            />
            <Layer
              id={`fill_${name}`}
              type="fill"
              paint={{ "fill-color": "rgba(13, 16, 92, 0.3)" }}
            />
          </Source>
        );
      })}

      {/* Children Component will be mounted here, and childrent component has siteChosenIndex as a prop */}
      <Outlet context={[siteChosenIndex || 0]} />
    </>
  );
};

export default SiteSelection;
