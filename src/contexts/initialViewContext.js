import { createContext } from "react";

export const initialViewState = createContext({
  longitude: -74.5,
  latitude: 40,
  // zoom level được tính toán sao cho globe fit với màn hình
  zoom: Math.min(window.innerWidth, window.innerHeight) * (2 / 742),
  pitch: 0,
});
