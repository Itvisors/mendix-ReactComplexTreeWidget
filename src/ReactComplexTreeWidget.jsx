import { createElement, useCallback } from "react";
import { TreeContainer } from "./components/TreeContainer";

// eslint-disable-next-line sort-imports
import "react-complex-tree/lib/style-modern.css";

export function ReactComplexTreeWidget(props) {
    const logMessageToConsole = message => {
        console.info(props.name + " " + new Date().toISOString() + " " + message);
    };

    const { onSelectionChangedAction, selectedNodeIDsAttr } = props;

    const onSelectionChangedHandler = useCallback(
        selectedItemIDs => {
            if (selectedNodeIDsAttr && selectedNodeIDsAttr.status === "available") {
                if (selectedNodeIDsAttr.readOnly) {
                    console.warn("ReactComplexTreeWidget: Selected node IDs attribute is readonly");
                } else {
                    selectedNodeIDsAttr.setValue(selectedItemIDs);
                }
            }
            if (
                onSelectionChangedAction &&
                onSelectionChangedAction.canExecute &&
                !onSelectionChangedAction.isExecuting
            ) {
                onSelectionChangedAction.execute();
            }
        },
        [onSelectionChangedAction, selectedNodeIDsAttr]
    );

    return (
        <TreeContainer
            dataChangedDate={props.dataChangeDateAttr.value}
            serviceUrl={props.serviceUrl.value}
            widgetName={props.name}
            onSelectionChanged={onSelectionChangedHandler}
            logMessageToConsole={logMessageToConsole}
            logToConsole={props.logToConsole}
            dumpServiceResponseInConsole={props.dumpServiceResponseInConsole}
        />
    );
}
