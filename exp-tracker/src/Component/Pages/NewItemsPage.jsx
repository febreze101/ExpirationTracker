import { useState } from "react";
import ItemCard from "../ItemCard";
import ItemsAccordion from "../ItemsAccordion";
import ItemsDisplay from "../ItemsDisplay";
import UpdatedNewItemCard from "../ItemCards/UpdatedNewItemCard";


export default function NewItemsPage(props) {


    return (
        <>
            <ItemsDisplay
                items={props.items}
                ItemComponent={UpdatedNewItemCard}
                handleExpirationDateChange={props.handleExpirationDateChange}
                handleExpired={props.handleExpired}
            />
        </>
    )
}