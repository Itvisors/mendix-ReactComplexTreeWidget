import { ControlledTreeEnvironment, Tree } from "react-complex-tree";
import { createElement, useCallback, useEffect, useReducer, useState } from "react";
import { Icon } from "mendix/components/web/Icon";
import treeDataReducer from "../utils/treeDataReducer";

export function TreeContainer({
    dataChangedDate,
    serviceUrl,
    widgetName,
    toggleExpandedIconOnly,
    allowNodeRename,
    allowDragReordering,
    allowDragMove,
    collapseAllButtonIcon,
    collapseAllButtonCaption,
    collapseAllButtonClass,
    showExpandAllButton,
    expandAllButtonIcon,
    expandAllButtonCaption,
    expandAllButtonClass,
    onSelectionChanged,
    onMissingNodes,
    onNodeRenamed,
    onDrop,
    logMessageToConsole,
    logToConsole,
    dumpServiceResponseInConsole
}) {
    const [treeData, dispatch] = useReducer(treeDataReducer, null);
    const [focusedItem, setFocusedItem] = useState();
    const [expandedItems, setExpandedItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    const onSelectionChangedHandler = useCallback(
        items => {
            const selectedIDs = items.join(",");
            if (logToConsole) {
                logMessageToConsole("onSelectionChangedHandler called for items " + selectedIDs);
            }

            // Set the new selection on the state
            setSelectedItems(items);

            // Call handler with item IDs joined into one string
            onSelectionChanged(selectedIDs);
        },
        [logMessageToConsole, logToConsole, onSelectionChanged]
    );

    const onExpandItemHandler = useCallback(
        item => {
            if (logToConsole) {
                logMessageToConsole("onExpandItemHandler: called for item " + item.index);
            }
            // First set the state so the tree renders the expanded item
            setExpandedItems([...expandedItems, item.index]);

            // The library has a missing child item callback but it does not work very well.
            // Item indeed has children
            if (item.children && item.children.length) {
                const firstChildID = item.children[0];
                // Request child nodes if not already available
                if (!treeData.data[firstChildID]) {
                    // Call handler with expanded item ID and its child IDs
                    const requestedIDs = item.index + "," + item.children.join(",");
                    if (logToConsole) {
                        logMessageToConsole("onExpandItemHandler: request items " + requestedIDs);
                    }
                    onMissingNodes(requestedIDs);
                }
            }
        },
        [expandedItems, logMessageToConsole, logToConsole, onMissingNodes, treeData?.data]
    );

    const onCollapseAllButtonClick = useCallback(() => {
        setExpandedItems([]);
    }, []);

    const onExpandAllButtonClick = useCallback(() => {
        const expandableItemIDs = [];
        for (const itemID in treeData.data) {
            if (treeData.data[itemID].children) {
                expandableItemIDs.push(itemID);
            }
        }
        setExpandedItems(expandableItemIDs);
    }, [treeData?.data]);

    const onRenameNodeHandler = useCallback(
        (item, newName) => {
            onNodeRenamed(item.index, newName);
        },
        [onNodeRenamed]
    );

    const onDropHandler = useCallback(
        (items, target) => {
            const draggedItemIDs = items.reduce((accumulator, item) => {
                if (accumulator) {
                    return accumulator + "," + item.index;
                } else {
                    return item.index;
                }
            }, null);
            if (logToConsole) {
                logMessageToConsole(
                    "onDropHandler: items " + draggedItemIDs + " dragged, drop info: " + JSON.stringify(target)
                );
            }
            onDrop(draggedItemIDs, target);
        },
        [logMessageToConsole, logToConsole, onDrop]
    );

    const canDragHandler = useCallback(items => {
        if (!items || items.length === 0) {
            return true;
        }

        // For a single item, check whether the item can be moved
        if (items.length === 1) {
            return items[0].canMove;
        }

        const firstParentID = items[0].data.parentID;
        return items.every(item => item.data.parentID === firstParentID && item.canMove);
    }, []);

    useEffect(() => {
        const processDataFromService = data => {
            const createTreeDataObject = () => {
                const newTreeData = {};
                for (const node of data.nodes) {
                    newTreeData[node.index] = {
                        index: node.index,
                        isFolder: node.isFolder,
                        canMove: node.canMove,
                        canRename: node.canRename,
                        data: {
                            name: node.name,
                            parentID: node.parentID
                        }
                    };
                    if (node.children) {
                        newTreeData[node.index].children = node.children.split(",");
                    }
                }
                return newTreeData;
            };

            const reloadTree = () => {
                const newTreeData = createTreeDataObject();
                dispatch({
                    type: "reload",
                    data: newTreeData
                });
            };

            const updateTree = () => {
                const newTreeData = createTreeDataObject();
                dispatch({
                    type: "update",
                    data: newTreeData,
                    deletedNodeIDs: data.deletedNodeIDs
                });
            };

            if (logToConsole) {
                if (data.nodes) {
                    logMessageToConsole("Received " + data.nodes.length + " nodes, action: " + data.action);
                } else {
                    logMessageToConsole("Received no nodes, action: " + data.action);
                }
                if (dumpServiceResponseInConsole) {
                    logMessageToConsole("Received service response:");
                    console.info(JSON.stringify(data));
                }
            }
            switch (data.action) {
                case "reload":
                    reloadTree(data);
                    break;

                case "update":
                    updateTree(data);
                    break;

                case "focus":
                    // No specific logic, focus is handled whenever the focusNodeID is returned. Focus action is added to allow setting focus only.
                    break;

                case "none":
                    break;

                default:
                    console.warn(" React complex tree unknown action: " + data.action);
                    break;
            }
            // Focus and select item if requested.
            if (data.focusNodeID) {
                if (logToConsole) {
                    logMessageToConsole("Set focus to " + data.focusNodeID);
                }
                setFocusedItem(data.focusNodeID);
                setSelectedItems([data.focusNodeID]);
            }

            // Expand items if requested.
            if (data.expandItemIDs) {
                const expandItemIDArray = data.expandItemIDs.split(",");
                if (data.resetExpandedItems) {
                    // Only expand the requested items
                    if (logToConsole) {
                        logMessageToConsole("Expand only items " + data.expandItemIDs);
                    }
                    setExpandedItems(expandItemIDArray);
                } else {
                    // Expand the requested items in addition to any already expanded items
                    if (logToConsole) {
                        logMessageToConsole("Expand items " + data.expandItemIDs);
                    }
                    setExpandedItems([...expandedItems, ...expandItemIDArray]);
                }
            } else {
                if (data.resetExpandedItems) {
                    // Clear expanded state, causing all nodes to be collapsed
                    if (logToConsole) {
                        logMessageToConsole("Reset expanded state, collapse all nodes");
                    }
                    setExpandedItems([]);
                }
            }
        };

        if (dataChangedDate) {
            if (logToConsole) {
                logMessageToConsole("Data changed date: " + dataChangedDate);
            }
        } else {
            if (logToConsole) {
                logMessageToConsole("Data changed date not set");
            }
            return;
        }

        // Even though the dependencies did not change, the effect got called way too often.
        // Double checked by logging the dependencies and comparing them as mentioned in the React useEffect documentation.
        // Keep track of dataChangedDate in the reducer and only call the service if the date really is different.
        if (dataChangedDate.getTime() === treeData?.dataChangedDate.getTime()) {
            if (logToConsole) {
                logMessageToConsole("Data changed date still the same");
            }
            return;
        }
        if (logToConsole) {
            logMessageToConsole("Data changed date changed");
        }
        dispatch({
            type: "setDataChangedDate",
            dataChangedDate: dataChangedDate
        });

        if (serviceUrl) {
            if (logToConsole) {
                logMessageToConsole("Call service using URL: " + serviceUrl);
            }
        } else {
            if (logToConsole) {
                logMessageToConsole("Service URL has no value");
            }
            return;
        }

        // eslint-disable-next-line no-undef
        const token = mx.session.getConfig("csrftoken");
        window
            .fetch(serviceUrl, {
                credentials: "include",
                headers: {
                    "X-Csrf-Token": token,
                    Accept: "application/json"
                }
            })
            .then(response => {
                if (response.ok) {
                    response.json().then(data => {
                        processDataFromService(data);
                    });
                } else {
                    console.error("Call to URL " + serviceUrl + " failed: " + response.statusText);
                }
            });
    }, [
        dataChangedDate,
        serviceUrl,
        logMessageToConsole,
        logToConsole,
        dumpServiceResponseInConsole,
        treeData,
        expandedItems
    ]);

    if (!treeData?.data) {
        if (logToConsole) {
            logMessageToConsole("No tree data");
        }
        return <div className="react-complex-tree-widget nodata"></div>;
    }

    const treeName = "tree-" + widgetName;
    const interactionMode = toggleExpandedIconOnly ? "click-arrow-to-expand" : "click-item-to-expand";
    return (
        <div className="react-complex-tree-widget">
            <div className="tree-widget-button-container">
                <button id="buttonCollapseAll" className={collapseAllButtonClass} onClick={onCollapseAllButtonClick}>
                    {collapseAllButtonIcon && <Icon icon={collapseAllButtonIcon} />}
                    <span>{collapseAllButtonCaption ? collapseAllButtonCaption : ""}</span>
                </button>
                {showExpandAllButton && (
                    <button id="buttonExpandAll" className={expandAllButtonClass} onClick={onExpandAllButtonClick}>
                        {expandAllButtonIcon && <Icon icon={expandAllButtonIcon} />}
                        <span>{expandAllButtonCaption ? expandAllButtonCaption : ""}</span>
                    </button>
                )}
            </div>
            <ControlledTreeEnvironment
                items={treeData.data}
                getItemTitle={item => item.data.name}
                viewState={{
                    [treeName]: {
                        focusedItem,
                        expandedItems,
                        selectedItems
                    }
                }}
                defaultInteractionMode={interactionMode}
                canRename={allowNodeRename}
                canDragAndDrop={allowDragReordering || allowDragMove}
                canReorderItems={allowDragReordering}
                canDropOnFolder={allowDragMove}
                canDropOnNonFolder={allowDragMove}
                onFocusItem={item => setFocusedItem(item.index)}
                onExpandItem={onExpandItemHandler}
                onCollapseItem={item =>
                    setExpandedItems(expandedItems.filter(expandedItemIndex => expandedItemIndex !== item.index))
                }
                onSelectItems={onSelectionChangedHandler}
                onRenameItem={onRenameNodeHandler}
                canDrag={canDragHandler}
                onDrop={onDropHandler}
            >
                <Tree treeId={treeName} rootItem="root" />
            </ControlledTreeEnvironment>
        </div>
    );
}
