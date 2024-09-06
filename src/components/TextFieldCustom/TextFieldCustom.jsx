import React, { useState } from "react";
import { styled, TextField } from "@mui/material";

const TextFieldStyled = styled(TextField)`
  label {
    color: #f0f0f0 !important;
    z-index: 99;
  }

  label.Mui-focused,
  label.MuiFormLabel-filled {
    font-size: 20px;
    font-weight: bold;
    color: pink !important;
  }

  input {
    color: #fff;
  }

  & .MuiOutlinedInput-notchedOutline {
    border-bottom: 1px solid #5e5e5f;
  }

  & .Mui-focused.MuiOutlinedInput-notchedOutline {
    border-color: pink !important;
  }

  .MuiTextField-root:has(label.MuiFormLabel-filled) input {
    border: 1px solid white !important;
  }
`;

const TextFieldCustom = ({
  label,
  type,
  variant = "outlined",
  value,
  triggers,
  fieldName,
  helperText,
  showHelper = false,
  isRequired,
  isDisabled = false,
}) => {
  const [isError, setIsError] = useState(false);
  const [isShowHelper, setIsShowHelper] = useState(showHelper);

  return (
    <TextFieldStyled
      label={label}
      type={type}
      variant={variant}
      value={value}
      error={isError}
      required={isRequired}
      disabled={isDisabled}
      autoComplete="off"
      onChange={(e) => {
        try {
          triggers(e);
          setIsError(false);
        } catch (error) {
          setIsError(true);
          setIsShowHelper(true);
        }
      }}
      name={fieldName}
      onBlur={() => !isError && setIsShowHelper(false)}
      helperText={
        <p className="text-[#FFCC29] text-[10px] leading-4 mt-1 italic">
          * {helperText}
        </p>
      }
    />
  );
};

export default TextFieldCustom;
