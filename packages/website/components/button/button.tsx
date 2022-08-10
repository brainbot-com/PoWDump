import React, { ButtonHTMLAttributes } from "react";

type ButtonType = "primary" | "secondary";

function Button(
  props: ButtonHTMLAttributes<{}> & {
    buttonType?: ButtonType;
    fullWidth?: boolean;
  }
) {
  return (
    <button
      {...props}
      className={`
        px-4 py-2 font-semibold rounded-full
        ${
          props.buttonType === "primary"
            ? "bg-blue-600 text-white"
            : "text-black"
        }
        ${props.disabled ? "opacity-50" : ""}
        ${props.fullWidth ? "w-full" : ""}
      `}
    >
      {props.children}
    </button>
  );
}

export { Button };
