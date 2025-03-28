import React from "react"
import DragAndDropCSV from "../DragnDropCSV"
import ItemsDisplay from "../ItemsDisplay"

export default function DashboardPage(props) {

    return (
        <>
            <DragAndDropCSV
                setInventoryData={props.handleNewData}
                setFileName={props.setFileName}
            />

            {/* <ItemsDisplay
                
            /> */}
        </>
    )
}