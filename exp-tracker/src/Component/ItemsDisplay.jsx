import React, { useState, Suspense, lazy } from "react";
import { Box, TextField, Typography, Skeleton, CircularProgress, LinearProgress } from "@mui/material";
import { useTheme } from "@mui/material";

export default function ItemsDisplay(props) {
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState("");

    // Lazy load the item component
    const LazyItemComponent = lazy(() =>
        Promise.resolve({
            default: props.ItemComponent
        })
    );

    const filteredItems = props.items.filter(item =>
        item['Item Name']?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item['Item_Name']?.toLowerCase().includes(searchQuery.toLowerCase())
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
                    flexWrap="wrap"
                    flexGrow={1}
                    height={300}
                    overflow="auto"
                    justifyContent="center"
                    gap={2}
                    sx={{
                        background: 'white',
                        boxSizing: 'border-box',
                        padding: 2,
                        mt: 2,
                        borderRadius: '4px',
                        // '&::-webkit-scrollbar': {
                        //     display: 'none',
                        // },
                    }}
                >
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

                    <Suspense fallback={
                        // [...Array(15)].map((_, index) => (
                        // <Skeleton key={index} animation='wave' variant="rectangular" width={310} height={200} />
                        // <Typography variant="h1">Loading</Typography>
                        <CircularProgress sx={{ color: theme.palette.forest.main }} />
                    }>
                        {filteredItems.map((item, index) => (
                            <LazyItemComponent
                                key={`${item["Item Name"] || item["item_name"] || "Unknown Item"}-${index}`}
                                title={item["Item Name"] || item["item_name"] || "Unknown Item"}
                                expirationDate={item["Expiration Date"] || item["expiration_date"] || null}
                                onDateChange={
                                    props.handleExpirationDateChange
                                        ? (newDate) =>
                                            props.handleExpirationDateChange(
                                                item["Item Name"] || item["item_name"],
                                                newDate
                                            )
                                        : undefined
                                }
                                onExpired={props.handleExpired ? () => props.handleExpired(item) : undefined}
                                onRestore={props.handleRestore ? () => props.handleRestore(item) : undefined}
                            />
                        ))}
                    </Suspense>
                </Box>
            </Box>
        </>
    )
}