import { useState } from "react";
import ExpiredItemCard from "../ExpiredItemCard";
import ItemsAccordion from "../ItemsAccordion";


export default function ExpiredItemsPage(props) {
    const [expanded, setExpanded] = useState(true)
    function handleChange() {
        setExpanded(!expanded)
    }
    return (
        <>
            <ItemsAccordion
                // expanded={expanded}
                chipColor="error"
                panel="panel3"
                handleChange={handleChange}
                title="Remove Immediately"
                searchLabel="Search Expired Items"
                items={props.items}
                ItemComponent={ExpiredItemCard}
                handleExpirationDateChange={props.handleExpirationDateChange}
                handleRestore={props.handleRestore}
            />
        </>
    )
}