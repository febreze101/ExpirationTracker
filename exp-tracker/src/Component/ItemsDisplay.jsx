import React, { useState, Suspense, lazy, useEffect, useCallback } from "react";
import { Box, TextField, Typography, Skeleton, CircularProgress, LinearProgress } from "@mui/material";
import { useTheme } from "@mui/material";

export default function ItemsDisplay(props) {
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState("");

    const [selectedDates, setSelectedDates] = useState([]);
    const [currentItemDetails, setCurrentItemDetails] = useState('')
    const [daysDiff, setDaysDiff] = useState([]);


    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const handleDateChange = (itemName, newDates) => {
        setSelectedDates(prev => ({
            ...prev,
            [itemName]: newDates, // Store dates by item name
        }));
    };

    // Lazy load the item component
    const LazyItemComponent = lazy(() =>
        Promise.resolve({
            default: props.ItemComponent
        })
    );

    // useEffect(() => {
    //     console.log("currentItemDetails: ", currentItemDetails)
    // })

    const handleGetExpirationDetails = useCallback(async (item) => {
        console.log("Fetching expiration details for:", item);
        const itemId = item["Item Name"] || item["item_name"] || "Unknown Item";

        try {
            const currDetails = await props.getExpirationDetails(item);

            console.log('Resolved Item details: ', currDetails)

            setCurrentItemDetails(prev => ({
                ...prev,
                [itemId]: currDetails
            }));

            console.log("currentItemDetails: ", currentItemDetails)
        } catch (error) {
            console.error("Error fetching item details:", error);
        }
    }, [props.getExpirationDetails]);

    const calcDaysDiff = useCallback(async (item) => {
        console.log("Fetching expiration details for:", item);
        const itemId = item["Item Name"] || item["item_name"] || "Unknown Item";

        try {
            const currDetails = await props.getExpirationDetails(item);
            console.log("earliest exp: ", currDetails.earliest_expiration);

            const upcomingExp = new Date(currDetails.earliest_expiration);
            const diffTime = upcomingExp - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            setDaysDiff(prev => ({
                ...prev,
                [itemId]: diffDays,  // Store per item
            }));
        } catch (error) {
            console.error("Error fetching item details: ", error);
        }
    }, []);


    const filteredItems = props.items.filter(item =>
        item['Item Name']?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item['item_Name']?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item['item_name']?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <Box
                display={'flex'}
                flexDirection={'column'}
                width={'100%'}
                height={'100%'}
                borderRadius={'4px'}
                sx={{
                    background: theme.palette.washiPaper.main,
                    boxSizing: 'border-box',
                    padding: 2
                }}
            >
                {/* title section */}
                <Box
                    display={'flex'}
                    flexDirection={'row'}
                    flexGrow={0}
                    alignItems={'center'}
                    justifyContent={'space-between'}
                >
                    <Typography variant="h2" color="black">{props.title || 'Expiring Items'}</Typography>

                    <Box>
                        <Typography
                            variant="body1"
                            color="black"
                        >
                            {props.items.length} items
                        </Typography>
                    </Box>
                </Box>

                {/* Items List */}
                <Box
                    display="flex"
                    flexDirection={'column'}
                    flexGrow={1}
                    justifyContent={'flex-start'}
                    height={300}
                    // overflow="auto"
                    // justifyContent="center"

                    sx={{
                        background: 'white',
                        boxSizing: 'border-box',
                        padding: 2,
                        mt: 2,
                    }}
                >
                    {/* Search Bar */}
                    <Box>
                        <TextField
                            fullWidth
                            label={props.searchLabel || "Start typing to search"}
                            variant="outlined"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                            }}
                            style={{ marginBottom: "10px" }}
                        />
                    </Box>

                    <Box
                        display="flex"
                        flexWrap="wrap"
                        padding={'4px 0'}
                        // height={'100%'}
                        gap={2}
                        overflow={'auto'}
                        justifyContent="center"
                        sx={{
                            borderRadius: '4px',
                            '&::-webkit-scrollbar': {
                                display: 'none',
                            }
                        }
                        }
                    >
                        <Suspense fallback={
                            <CircularProgress sx={{ color: theme.palette.forest.main }} />
                        }>
                            {filteredItems.map((item, index) => {
                                const itemId = item["Item Name"] || item["item_name"] || "Unknown Item";
                                useEffect(() => {
                                    handleGetExpirationDetails(item)
                                    calcDaysDiff(item)
                                }, [item])

                                return (
                                    <props.ItemComponent
                                        key={`${itemId}-${index}`}
                                        title={itemId}
                                        expirationDates={selectedDates[itemId] || []}
                                        daysDiff={daysDiff[itemId] || 0}
                                        numDatesSet={item.num_dates_set}
                                        itemDetails={currentItemDetails[itemId] || null}
                                        onDateChange={
                                            props.handleExpirationDateChange
                                                ? (newDate) =>
                                                    props.handleExpirationDateChange(
                                                        itemId,
                                                        newDate
                                                    )
                                                : undefined
                                        }
                                        onDetailRequest={() => handleGetExpirationDetails(item)}
                                        onExpired={
                                            props.handleExpired
                                                ? () => props.handleExpirationDateChange(itemId, today)
                                                : undefined
                                        }
                                        onRestore={
                                            props.handleRestore
                                                ? () => props.handleRestore(item)
                                                : undefined
                                        }
                                    />
                                );
                            })}
                        </Suspense>
                    </Box>

                </Box >
            </Box >
        </>
    )
}