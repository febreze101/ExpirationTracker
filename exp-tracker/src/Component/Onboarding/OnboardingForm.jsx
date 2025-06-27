import React, { useEffect, useState } from 'react'
import { Box, Modal, Stack, Typography, useTheme } from '@mui/material'


import OnboardingWelcome from './OnboardingWelcome'
import OnboardingStart from './OnboardingStart'
import OnboardingNotificationSetup from './OnboardingNotificationSetup'
import OnboardingNotificationFrequency from './OnboardingNotificationFrequency'
import OnboardingDone from './OnboardingDone'


export default function OnboardingForm({ showOnboarding, setShowOnboarding, handleAddUser, createNewWorkspace, joinWorkspace }) {
    // const [showOnboarding, setShowOnboarding] = useState(localStorage.getItem('hasCompletedOnboarding') !== "true")
    const [step, setStep] = useState(0)
    const [formData, setFormData] = useState({
        workspace_name: "",
        workspace_emails: [],
        frequency: "daily",
        onboardingComplete: false,
    })

    // retrieve onbaording info from db to chec
    const handleOnboardingComplete = () => {
        console.log("user colllected info", formData)
        localStorage.setItem('hasCompletedOnboarding', 'true')
        setShowOnboarding(false);

        // extract emails
        const emails = formData.workspace_emails?.map(e => e.value) || []

        const user = {
            workspace_name: formData.workspace_name,
            reminder_frequency: formData.frequency ?? 'daily',
            onboardingComplete: 1,
            emails: emails
        }

        console.log('user to add', user)

        try {
            handleAddUser(user);
            console.log('User added successfully');
        } catch (error) {
            console.error('Failed to add user', error);
        }

        // // create new workspace
        if (formData.workspace_name && formData.workspace_name.trim() !== "") {
            console.log("Creating new workspace with name:", formData.workspace_name);
            createNewWorkspace(formData.workspace_name);
        } else {
            console.error("Workspace name is required to create a new workspace.");
        }
    }

    const handleNext = () => {
        setStep(prevStep => prevStep + 1)
    }

    const handleBack = () => {
        setStep(prevStep => prevStep - 1)
    }
    const steps = [
        <OnboardingWelcome
            data={formData}
            setData={setFormData}
            handleNext={handleNext}
        />,
        <OnboardingStart
            data={formData}
            setData={setFormData}
            handleNext={handleNext}
            handleBack={handleBack}
            createNewWorkspace={createNewWorkspace}
        />,
        <OnboardingNotificationSetup
            data={formData}
            setData={setFormData}
            handleNext={handleNext}
            handleBack={handleBack} />,
        <OnboardingNotificationFrequency
            data={formData}
            setData={setFormData}
            handleNext={handleNext}
            handleBack={handleBack}
        />,
        <OnboardingDone
            data={formData}
            setData={setFormData}
            handleOnboardingComplete={handleOnboardingComplete}
            handleNext={handleNext}
        />,
    ]

    return (
        <>
            {
                showOnboarding && (
                    <Modal
                        open={showOnboarding}
                        onClose={() => { setShowOnboarding(false) }}
                        keepMounted
                    >
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            height="100vh"
                        >
                            {steps[step]}
                        </Box>
                    </Modal>

                )
            }
        </>
    )
}