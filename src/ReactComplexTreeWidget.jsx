import { createElement, useCallback } from "react";
import { TreeContainer } from "./components/TreeContainer";

// eslint-disable-next-line sort-imports
import "react-complex-tree/lib/style-modern.css";

export function ReactComplexTreeWidget(props) {
    const logMessageToConsole = useCallback(
        message => {
            console.info(props.name + " " + new Date().toISOString() + " " + message);
        },
        [props.name]
    );

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

    const { onMissingNodesAction, missingNodeIDsAttr } = props;
    const onMissingNodesHandler = useCallback(
        missingItemIDs => {
            if (missingNodeIDsAttr && missingNodeIDsAttr.status === "available") {
                if (missingNodeIDsAttr.readOnly) {
                    console.warn("ReactComplexTreeWidget: Missing node IDs attribute is readonly");
                } else {
                    missingNodeIDsAttr.setValue(missingItemIDs);
                }
            }
            if (onMissingNodesAction && onMissingNodesAction.canExecute && !onMissingNodesAction.isExecuting) {
                onMissingNodesAction.execute();
            }
        },
        [missingNodeIDsAttr, onMissingNodesAction]
    );

    return (
        <TreeContainer
            dataChangedDate={props.dataChangeDateAttr.value}
            serviceUrl={props.serviceUrl.value}
            widgetName={props.name}
            toggleExpandedIconOnly={props.toggleExpandedIconOnly}
            collapseAllButtonIcon={props.collapseAllButtonIcon?.value}
            collapseAllButtonCaption={props.collapseAllButtonCaption?.value}
            collapseAllButtonClass={props.collapseAllButtonClass}
            showExpandAllButton={!!props.showExpandAllButton?.value}
            expandAllButtonIcon={props.expandAllButtonIcon?.value}
            expandAllButtonCaption={props.expandAllButtonCaption?.value}
            expandAllButtonClass={props.expandAllButtonClass}
            onSelectionChanged={onSelectionChangedHandler}
            onMissingNodes={onMissingNodesHandler}
            logMessageToConsole={logMessageToConsole}
            logToConsole={props.logToConsole}
            dumpServiceResponseInConsole={props.dumpServiceResponseInConsole}
        />
    );
}
