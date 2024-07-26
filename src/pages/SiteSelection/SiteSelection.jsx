import { useCallback, useEffect, useState } from "react";
import { Layer, Marker, Source, useMap } from "react-map-gl";
import { Outlet, useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";

import "./SiteSelection.css";

import { siteSelectionData } from "../../assets/data/site";

const SitePolygon = ({ feature, index, map, setSiteChosenIndex }) => {
  const navigate = useNavigate();

  let name = `site_${feature.name}`;

  // Set event listeners to each layer
  useEffect(() => {
    function handleChooseSite() {
      setSiteChosenIndex(index);
      navigate(`./${index}`);
    }

    function handleHoverChangeCursor() {
      map.getMap().doubleClickZoom.disable();
      map.getCanvas().style.cursor = "pointer";
    }

    function handleDragChangeCursor() {
      map.getCanvas().style.cursor = "grab";
    }

    function reset() {
      map.getMap().doubleClickZoom.enable();
      map.getCanvas().style.cursor = "grab";
    }

    map.on("click", `fill_${name}`, handleChooseSite);
    map.on("mouseenter", `fill_${name}`, handleHoverChangeCursor);
    map.on("mouseleave", `fill_${name}`, reset);
    map.on("dragstart", `fill_${name}`, handleDragChangeCursor);
    map.on("dragend", `fill_${name}`, reset);

    return () => {
      map.off("click", `fill_${name}`, handleChooseSite);
      map.off("mouseenter", `fill_${name}`, handleHoverChangeCursor);
      map.off("mouseleave", `fill_${name}`, reset);
      map.off("dragstart", `fill_${name}`, handleDragChangeCursor);
      map.off("dragend", `fill_${name}`, reset);
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
};

const SiteSelection = () => {
  // this is represents the selected area index
  const [siteChosenIndex, setSiteChosenIndex] = useState(null);

  const { map } = useMap();

  useEffect(() => {
    handleLoadSite();
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

  return (
    <>
      {siteSelectionData.features.map((feature, index) => (
        <SitePolygon
          key={`site_${feature.name}`}
          feature={feature}
          index={index}
          map={map}
          setSiteChosenIndex={setSiteChosenIndex}
        />
      ))}

      {/* Children Component will be mounted here, and childrent component has siteChosenIndex as a prop */}
      <Outlet context={[siteChosenIndex || 0]} />
    </>
  );
};

export default SiteSelection;
