import { SpeedDial, SpeedDialAction, styled } from "@mui/material";
import React from "react";

const StyledSpeedDial = styled(SpeedDial)(() => ({
  "&.MuiSpeedDial-directionUp .MuiSpeedDial-fab, &.MuiSpeedDial-directionLeft .MuiSpeedDial-fab, &.MuiSpeedDial-directionDown .MuiSpeedDial-fab, &.MuiSpeedDial-directionRight .MuiSpeedDial-fab":
    {
      minHeight: "unset",
      width: "45px",
      height: "45px",
      background: "pink",
    },
  "&.MuiSpeedDial-directionDown, &.MuiSpeedDial-directionRight": {},
  "&.MuiSpeedDial-directionUp .MuiSpeedDial-actions .MuiFab-root": {
    minHeight: "unset",
    width: "35px",
    height: "35px",
  },

  "&.MuiSpeedDial-directionRight .MuiSpeedDial-actions .MuiFab-root": {
    minHeight: "unset",
    width: "30px",
    height: "30px",
  },
}));

const SpeedDialCustom = ({
  direction = "left",
  icon = <i className="fa-solid fa-gear text-xl"></i>,
  actions,
}) => {
  return (
    <StyledSpeedDial
      direction={direction}
      icon={icon}
      ariaLabel="SpeedDial playground example"
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          title={action.name}
          tooltipOpen={false}
          onClick={action.action}
          FabProps={{ style: { backgroundColor: action?.bg } }}
        />
      ))}
    </StyledSpeedDial>
  );
};

export default SpeedDialCustom;
