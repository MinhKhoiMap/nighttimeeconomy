import React from "react";
import { Slider, styled } from "@mui/material";

const PrettoSlider = styled(Slider)({
  color: "pink",
  height: 5,
  "& .MuiSlider-track": {
    border: "none",
  },
  "& .MuiSlider-valueLabelLabel": {
    color: "black",
  },
  "& .MuiSlider-thumb": {
    height: 20,
    width: 20,
    backgroundColor: "#fff",
    border: "4px solid currentColor",
    "&:focus, &.Mui-active, &.Mui-focusVisible": {
      boxShadow: "currentColor",
    },
    "&:hover": {
      boxShadow: "0 0 10px white",
    },
    "&::before": {
      display: "none",
    },
  },

  "& .MuiSlider-valueLabel": {
    lineHeight: 1.2,
    fontSize: 12,
    background: "unset",
    padding: "5px 6px",
    width: "fit-content",
    aspectRatio: "1 / 1",
    borderRadius: "50% 50% 50% 0",
    backgroundColor: "pink",
    transformOrigin: "bottom left",
    transform: "translate(50%, -100%) rotate(-45deg) scale(0)",
    "&::before": { display: "none" },
    "&.MuiSlider-valueLabelOpen": {
      transform: "translate(50%, -100%) rotate(-45deg) scale(1)",
    },
    "& > *": {
      transform: "rotate(45deg)",
    },
  },
});

const SliderCustom = ({
  defaultValue,
  min,
  max,
  name,
  formatLabel = (value) => value,
  updateState,
}) => {
  return (
    <PrettoSlider
      valueLabelDisplay="auto"
      defaultValue={defaultValue}
      min={min}
      max={max}
      onChange={(e) => updateState(e.target.value)}
      name={name}
      valueLabelFormat={formatLabel}
      id={name}
    />
  );
};

export default SliderCustom;
