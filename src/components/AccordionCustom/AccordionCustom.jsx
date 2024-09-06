import React, { useState } from "react";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  styled,
} from "@mui/material";

const AccordionStyled = styled(Accordion)`
  background: transparent;
  color: #fff;
  border: 1px solid #5f5e5e;
  overflow: hidden;

  .MuiAccordionSummary-root {
    background-color: #000 !important;
    font-size: 20px;
  }

  .MuiAccordionSummary-root.Mui-expanded {
    min-height: unset;
  }

  .MuiAccordionSummary-root.MuiAccordionSummary-content {
    font-weight: bold;
  }

  .MuiAccordionSummary-content.Mui-expanded {
    margin: 20px 0 !important;
  }

  .MuiAccordionDetails-root {
    font-size: 16px;
  }
`;

const AccordionCustom = ({
  children,
  summary,
  detailStyles,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <AccordionStyled
      expanded={isExpanded}
      onChange={() => setIsExpanded(!isExpanded)}
    >
      <AccordionSummary
        expandIcon={
          <span className="text-white text-2xl">
            {isExpanded ? (
              <i className="fa-solid fa-circle-minus"></i>
            ) : (
              <i className="fa-solid fa-circle-plus"></i>
            )}
          </span>
        }
      >
        {summary}
      </AccordionSummary>
      <AccordionDetails
        style={{
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          ...detailStyles,
        }}
      >
        {children}
      </AccordionDetails>
    </AccordionStyled>
  );
};

export default AccordionCustom;
