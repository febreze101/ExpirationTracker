import { createTheme } from "@mui/material"

export const theme = createTheme({
    typography: {
        fontFamily: [
            'adobe-garamond-pro',
            'ff-meta-headline-web-pro',
        ].join(','),
        h1: {
            fontSize: '3.5rem',
            fontFamily: ['adobe-garamond-pro', 'serif'].join(',')
        },
        h2: {
            fontSize: '2.25rem',
            fontFamily: ['adobe-garamond-pro', 'serif'].join(',')
        },
        h3: {
            fontSize: '1rem',
            fontFamily: ['adobe-garamond-pro', 'serif'].join(',')
        },
        body1: {
            fontSize: '1rem',
            fontFamily: ['ff-meta-headline-web-pro', 'sans-serif'].join(',')
        },
        body2: {
            fontSize: '1rem',
            fontFamily: ['ff-meta-headline-web-pro', 'sans-serif'].join(','),
            color: 'rgba(128, 128, 128, 0.5)'
        },
    },
    palette: {
        black: {
            main: '#171717'
        },
        forest: {
            main: '#063B27'
        },
        washiPaper: {
            main: '#F1EAE3'
        },
        red: {
            main: '#91383A'
        },
        Tan: {
            main: '#907C64'
        },
        grey: {
            main: '#444444'
        }
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 480,
            md: 768,
            lg: 1024,
            xl: 1440,
        }
    }
})
