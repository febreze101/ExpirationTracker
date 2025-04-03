import { useState } from "react";
import ExpiredItemCard from "../ExpiredItemCard";
import ItemsAccordion from "../ItemsAccordion";
import ItemsDisplay from "../ItemsDisplay";
import UpdatedExpiredItemCard from "../ItemCards/UpdatedExpiredCard";

export default function ExpiredItemsPage(props) {
    const [expanded, setExpanded] = useState(true)

    return (
        <>
            {/* <ItemsAccordion
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
            /> */}
            <ItemsDisplay
                items={props.items}
                ItemComponent={UpdatedExpiredItemCard}
                handleExpirationDateChange={props.handleExpirationDateChange}
                // handleExpired={props.handleExpired}
                handleRestore={props.handleRestore}
            />
        </>
    )
}