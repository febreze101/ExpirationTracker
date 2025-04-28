import React from 'react'
import { Box, Stack, Typography, useTheme } from '@mui/material'


import OnboardingWelcome from './OnboardingWelcome'
import OnboardingStart from './OnboardingStart'
import OnboardingNotificationSetup from './OnboardingNotificationSetup'
import OnboardingNotificationFrequency from './OnboardingNotificationFrequency'
import OnboardingDone from './OnboardingDone'


export default function OnboardingForm() {

    const [step, setSteps] = useState(0)
    const [formData, setFormData] = useState({
        workspace_name: "",
        email: "",
        frequency: "",
        onboardingComplete: false,
    })

    const steps = [
        <OnboardingWelcome data={formData} setData={setFormData} />,
        <OnboardingStart data={formData} setData={setFormData} />,
        <OnboardingNotificationSetup data={formData} setData={setFormData} />,
        <OnboardingNotificationFrequency data={formData} setData={setFormData} />,
        <OnboardingDone data={formData} setData={setFormData} />,
    ]

    return (
        <>
            <Modal>
                {steps[step]}
            </Modal>
        </>
    )
}