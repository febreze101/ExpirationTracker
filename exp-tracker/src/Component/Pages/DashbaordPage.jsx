import React from "react"
import DragAndDropCSV from "../DragnDropCSV"
import ItemsDisplay from "../ItemsDisplay"
import OnboardingForm from "../Onboarding/OnboardingForm";
import OnboardingStart from "../Onboarding/OnboardingStart";
import OnboardingNotificationSetup from "../Onboarding/OnboardingNotificationSetup";
import OnboardingNotificationFrequency from "../Onboarding/OnboardingNotificationFrequency";
import OnboardingDone from "../Onboarding/OnboardingDone";
import { Stack, Box } from "@mui/material";

export default function DashboardPage(props) {
    console.log("handleNewData prop is", typeof props.handleNewData);

    return (
        <>
            <DragAndDropCSV
                handleNewData={props.handleNewData}
                setFileName={props.setFileName}
            />
        </>
    )
}