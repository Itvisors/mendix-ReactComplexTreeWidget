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

    const { onNodeRenamedAction, renamedNodeIDAttr, newNodeNameAttr } = props;
    const onNodeRenamedHandler = useCallback(
        (nodeID, newName) => {
            if (renamedNodeIDAttr && renamedNodeIDAttr.status === "available") {
                if (renamedNodeIDAttr.readOnly) {
                    console.warn("ReactComplexTreeWidget: Event node ID attribute is readonly");
                } else {
                    renamedNodeIDAttr.setValue(nodeID);
                }
            }
            if (newNodeNameAttr && newNodeNameAttr.status === "available") {
                if (newNodeNameAttr.readOnly) {
                    console.warn("ReactComplexTreeWidget: Event node ID attribute is readonly");
                } else {
                    newNodeNameAttr.setValue(newName);
                }
            }

            if (onNodeRenamedAction && onNodeRenamedAction.canExecute && !onNodeRenamedAction.isExecuting) {
                onNodeRenamedAction.execute();
            }
        },
        [renamedNodeIDAttr, newNodeNameAttr, onNodeRenamedAction]
    );

    const { onDropAction, draggedNodeIDsAttr, dropTargetAttr } = props;

    const onDropHandler = useCallback(
        (droppedNodeIDs, target) => {
            if (draggedNodeIDsAttr && draggedNodeIDsAttr.status === "available") {
                if (draggedNodeIDsAttr.readOnly) {
                    console.warn("ReactComplexTreeWidget: Dragged node IDs attribute is readonly");
                } else {
                    draggedNodeIDsAttr.setValue(droppedNodeIDs);
                }
            }
            if (dropTargetAttr && dropTargetAttr.status === "available") {
                if (dropTargetAttr.readOnly) {
                    console.warn("ReactComplexTreeWidget: Drop target ID attribute is readonly");
                } else {
                    dropTargetAttr.setValue(JSON.stringify(target));
                }
            }
            if (onDropAction && onDropAction.canExecute && !onDropAction.isExecuting) {
                onDropAction.execute();
            }
        },
        [draggedNodeIDsAttr, dropTargetAttr, onDropAction]
    );

    return (
        <TreeContainer
            dataChangedDate={props.dataChangeDateAttr.value}
            serviceUrl={props.serviceUrl.value}
            widgetName={props.name}
            widgetClassName={props.class}
            toggleExpandedIconOnly={props.toggleExpandedIconOnly}
            allowNodeRename={props.allowNodeRename}
            allowDragReordering={props.allowDragReordering}
            allowDragMove={props.allowDragMove}
            collapseAllButtonIcon={props.collapseAllButtonIcon?.value}
            collapseAllButtonCaption={props.collapseAllButtonCaption?.value}
            collapseAllButtonClass={props.collapseAllButtonClass}
            showExpandAllButton={!!props.showExpandAllButton?.value}
            expandAllButtonIcon={props.expandAllButtonIcon?.value}
            expandAllButtonCaption={props.expandAllButtonCaption?.value}
            expandAllButtonClass={props.expandAllButtonClass}
            onSelectionChanged={onSelectionChangedHandler}
            onMissingNodes={onMissingNodesHandler}
            onNodeRenamed={onNodeRenamedHandler}
            onDrop={onDropHandler}
            logMessageToConsole={logMessageToConsole}
            logToConsole={props.logToConsole}
            dumpServiceResponseInConsole={props.dumpServiceResponseInConsole}
        />
    );
}
