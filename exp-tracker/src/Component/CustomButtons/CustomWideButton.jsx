import React from "react";
import { Button, styled } from "@mui/material";

const CustomWideButton = styled(Button)(({ bgcolor, color, border }) => ({
    backgroundColor: bgcolor || '#063B27',
    color: color || 'white',
    width: '300px',
    height: '45px',
    borderRadius: '2px',
    textTransform: 'uppercase',

    "& .buttonText": {
        display: "inline-block",
        transition: "all 0.3s ease",
        willChange: "transform",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)", // This will help with rendering clarity
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
    },

    '&:hover': {
        "& .buttonText": {
            textDecoration: "underline",
            // transform: "scale(1.048)",

        }
    },
    "&": {
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
    }
}));

export default function WideButton({ children, onClick, ...props }) {
    return (
        <CustomWideButton
            variant={'contained' || props.vairant}
            disableElevation
            bgcolor={props.bgColor}
            color={props.textColor}
            border={props.border}
            {...props}
            onClick={onClick}
        >
            <span className="buttonText">{children}</span>
        </CustomWideButton>
    )
}