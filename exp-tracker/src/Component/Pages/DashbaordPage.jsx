import React from "react"
import DragAndDropCSV from "../DragnDropCSV"
import ItemsDisplay from "../ItemsDisplay"

export default function DashboardPage(props) {
    console.log("handleNewData prop is", typeof props.handleNewData);

    return (
        <>
            <DragAndDropCSV
                handleNewData={props.handleNewData}
                setFileName={props.setFileName}
            />
        </>
    )
}