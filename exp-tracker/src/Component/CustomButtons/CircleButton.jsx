import React from "react";
import { Button, styled } from "@mui/material";

const CustomCircleButton = styled(Button)(({ bgColor }) => ({
    backgroundColor: bgColor || '#063B27',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    padding: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '50px',
    minHeight: '50px',
}))

export default function CircleButton({ icon, onClick, ...props }) {
    return (
        <CustomCircleButton
            variant="contained"
            disableElevation
            bgColor={props.color}
            onClick={onClick}
            {...props}
        >
            {icon}
        </CustomCircleButton>
    )
}