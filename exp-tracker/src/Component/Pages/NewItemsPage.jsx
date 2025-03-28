import { useState } from "react";
import ItemCard from "../ItemCard";
import ItemsAccordion from "../ItemsAccordion";
import ItemsDisplay from "../ItemsDisplay";


export default function NewItemsPage(props) {


    return (
        <>
            {/* <ItemsAccordion
                // expanded={props.expanded}
                chipColor="success"
                panel="panel1"
                // handleChange={handleChange}
                title="Untracked Items"
                searchLabel="Search Untracked Items"
                items={props.items}
                ItemComponent={ItemCard}
                handleExpirationDateChange={props.handleExpirationDateChange}
                handleExpired={props.handleExpired}
            /> */}

            <ItemsDisplay
                items={props.items}
                ItemComponent={ItemCard}
                handleExpirationDateChange={props.handleExpirationDateChange}
                handleExpired={props.handleExpired}
            />
        </>
    )
}