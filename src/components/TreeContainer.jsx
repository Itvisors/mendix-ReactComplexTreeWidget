import { ControlledTreeEnvironment, Tree } from "react-complex-tree";
import { createElement, useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Icon } from "mendix/components/web/Icon";
import treeDataReducer from "../utils/treeDataReducer";

export function TreeContainer({
    dataChangedDate,
    serviceUrl,
    widgetName,
    toggleExpandedIconOnly,
    collapseAllButtonIcon,
    collapseAllButtonCaption,
    collapseAllButtonClass,
    showExpandAllButton,
    expandAllButtonIcon,
    expandAllButtonCaption,
    expandAllButtonClass,
    onSelectionChanged,
    onMissingNodes,
    logMessageToConsole,
    logToConsole,
    dumpServiceResponseInConsole
}) {
    const treeRef = useRef();
    const environmentRef = useRef();
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
        // The treeref cannot be used for controlled trees, set the state directly.
        setExpandedItems([]);
    }, []);

    const onExpandAllButtonClick = useCallback(() => {
        // The treeref cannot be used for controlled trees, set the state directly.
        const expandableItemIDs = [];
        for (const itemID in treeData.data) {
            if (treeData.data[itemID].children) {
                expandableItemIDs.push(itemID);
            }
        }
        setExpandedItems(expandableItemIDs);
    }, [treeData?.data]);

    useEffect(() => {
        const processDataFromService = data => {
            const createTreeDataObject = () => {
                const newTreeData = {};
                for (const node of data.nodes) {
                    newTreeData[node.index] = node;
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
            if (treeRef.current) {
                // Focus and select item if requested.
                if (data.focusNodeID) {
                    if (logToConsole) {
                        logMessageToConsole("Set focus to " + data.focusNodeID);
                    }
                    treeRef.current.focusItem(data.focusNodeID);
                    treeRef.current.selectItems([data.focusNodeID]);
                }

                // Expand items if requested.
                if (data.expandItemIDs) {
                    if (logToConsole) {
                        logMessageToConsole("Expand items " + data.expandItemIDs);
                    }
                    for (const expandItemID of data.expandItemIDs.split(",")) {
                        treeRef.current.expandItem(expandItemID);
                    }
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
        treeData?.dataChangedDate
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
                ref={environmentRef}
                items={treeData.data}
                getItemTitle={item => item.data}
                viewState={{
                    [treeName]: {
                        focusedItem,
                        expandedItems,
                        selectedItems
                    }
                }}
                defaultInteractionMode={interactionMode}
                onFocusItem={item => setFocusedItem(item.index)}
                onExpandItem={onExpandItemHandler}
                onCollapseItem={item =>
                    setExpandedItems(expandedItems.filter(expandedItemIndex => expandedItemIndex !== item.index))
                }
                onSelectItems={onSelectionChangedHandler}
            >
                <Tree treeId={treeName} rootItem="root" ref={treeRef} />
            </ControlledTreeEnvironment>
        </div>
    );
}
