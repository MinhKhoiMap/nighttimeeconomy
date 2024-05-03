import { useCallback, useEffect, useState } from "react";
import { Layer, Marker, Source, useMap } from "react-map-gl";
import { Outlet, useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";

import "./SiteSelection.css";

import { siteSelectionData } from "../../assets/data/site";
import Button from "../../components/Button/Button";

const SiteSelection = ({ area }) => {
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

  const handleLoadSite = useCallback(() => {
    var bounds = new mapboxgl.LngLatBounds();
    siteSelectionData.features.forEach((feature) => {
      feature.geometry.coordinates[0].forEach((coordinate) =>
        bounds.extend(coordinate)
      );
    });

    map.fitBounds(bounds, {
      padding: { top: 20, bottom: 20, left: 20, right: 20 },
    });
  }, [map]);

  const siteLayerHandler = useCallback(
    (name, feature, id) => {
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

      map.on("dragend", `fill_${name}`, (e) => {
        map.getCanvas().style.cursor = "cursor";
      });
    },
    [map]
  );

  return (
    <>
      {siteSelectionData.features.map((feature, index) => {
        let name = `site_${feature.name}`;
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

      <Outlet context={[siteChosenIndex || 0]} />
    </>
  );
};

export default SiteSelection;
