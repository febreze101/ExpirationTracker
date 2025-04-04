import { useState } from "react";
import ItemCardwithExpirationSet from "../ItemCardwithExpirationSet";
import ItemsAccordion from "../ItemsAccordion";
import UpdatedNewItemCard from "../ItemCards/UpdatedNewItemCard";
import ItemsDisplay from "../ItemsDisplay";
import UpdatedExpiringCard from "../ItemCards/UpdatedExpiringCard";


export default function ExpiringItemsPage(props) {

    const [expanded, setExpanded] = useState(true)
    function handleChange() {
        setExpanded(!expanded)
    }
    return (
        <>
            {/* <ItemsAccordion
                // expanded={props.expanded}
                chipColor="warning"
                panel="panel2"
                handleChange={handleChange}
                title="Expiring Soon"
                searchLabel="Search Items Expiring Soon"
                items={props.items}
                ItemComponent={ItemCardwithExpirationSet}
                handleExpirationDateChange={props.handleExpirationDateChange}
                handleExpired={props.handleExpired}
            /> */}

            <ItemsDisplay
                pageTitle={'Expiring Items'}
                items={props.items}
                ItemComponent={UpdatedExpiringCard}
                getExpirationDetails={props.getExpirationDetails}
                handleExpirationDateChange={props.handleExpirationDateChange}
                handleExpired={props.handleExpired}
            />
        </>
    )
}