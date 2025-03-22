import { Accordion, AccordionDetails, AccordionSummary, Typography, TextField, Box, Chip } from "@mui/material";
import React, { useState } from "react";
import Pagination from "./Pagination";

export default function ItemsAccordion({
    expanded,
    chipColor,
    panel,
    handleChange,
    title,
    searchLabel,
    items,
    ItemComponent,
    handleExpirationDateChange,
    handleExpired,
    handleRestore,
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Filter items based on search
    const filteredItems = items.filter((item) =>
        (item["Item Name"] || item["item_name"] || "Unknown Item")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    // Pagination calcs
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <Accordion
            expanded={expanded === panel}
            onChange={handleChange(panel)}>

            <AccordionSummary>
                <Typography>{title} <Chip color={chipColor} label={filteredItems.length} size="small" /></Typography>
            </AccordionSummary>
            <AccordionDetails>
                {/* Search Bar */}
                <TextField
                    fullWidth
                    label={searchLabel}
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1); // Reset to page 1 on new search
                    }}
                    style={{ marginBottom: "10px" }}
                />

                {/* Items List */}
                <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2}>
                    {paginatedItems.length > 0 ? (
                        paginatedItems.map((item, index) => (
                            <ItemComponent
                                key={`${item["Item Name"] || item["item_name"] || "Unknown Item"}-${index}`}
                                title={item["Item Name"] || item["item_name"] || "Unknown Item"}
                                expirationDate={item["Expiration Date"] || item["expiration_date"] || null}
                                onDateChange={(newDate) =>
                                    handleExpirationDateChange && handleExpirationDateChange(item["Item Name"] || item["item_name"], newDate)
                                }
                                onExpired={() => handleExpired && handleExpired(item)}
                                onRestore={() => handleRestore && handleRestore(item)}
                            />
                        ))
                    ) : (
                        <Typography>No items found.</Typography>
                    )}
                </Box>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                )}
            </AccordionDetails>
        </Accordion>
    );
}
