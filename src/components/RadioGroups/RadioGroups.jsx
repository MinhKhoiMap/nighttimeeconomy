import React, { useState } from "react";

const RadioGroups = ({ items, nameGroup, defaultValue, setValue }) => {
  return (
    <div
      className="mt-2 overflow-auto pb-2"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        columnGap: "20px",
        rowGap: "10px",
      }}
    >
      {items.map((item, index) => {
        if (index % 2 == 0)
          return (
            <div
              key={index}
              className="py-[3px] px-[5px] rounded-md w-full flex items-center justify-between gap-2 cursor-pointer hover:bg-[#5e5e5e5f] transition-colors"
            >
              <label
                htmlFor={item}
                className="truncate flex-1 hover:brightness-110 cursor-pointer"
                style={{ color: items[index + 1] }}
                title={item}
              >
                {item}
              </label>
              <input
                type="radio"
                id={item}
                name={nameGroup}
                value={item}
                checked={defaultValue === item}
                onChange={setValue}
                className="cursor-pointer"
                style={{ color: items[index + 1] }}
              />
            </div>
          );
      })}
    </div>
  );
};

export default RadioGroups;
