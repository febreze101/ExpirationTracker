import { useState } from "react";
import ItemsDisplay from "../ItemsDisplay";
import UpdatedExpiredItemCard from "../ItemCards/UpdatedExpiredCard";

export default function ExpiredItemsPage(props) {
    const [expanded, setExpanded] = useState(true)

    return (
        <>
            <ItemsDisplay
                pageTitle={'Expired Items'}
                items={props.items}
                ItemComponent={UpdatedExpiredItemCard}
                handleExpirationDateChange={props.handleExpirationDateChange}
                handleRestore={props.handleRestore}
                handleOnDeleteItem={props.handleOnDeleteItem}
            />
        </>
    )
}