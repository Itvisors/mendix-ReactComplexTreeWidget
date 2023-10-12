import { ControlledTreeEnvironment, Tree } from "react-complex-tree";
import { createElement, useCallback, useEffect, useReducer, useRef, useState } from "react";
import treeDataReducer from "../utils/treeDataReducer";

export function TreeContainer({
    dataChangedDate,
    serviceUrl,
    widgetName,
    toggleExpandedIconOnly,
    onSelectionChanged,
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
            setSelectedItems(items);
            logMessageToConsole("onSelectionChangedHandler");
            console.dir(items);
            const selectedIDs = items.reduce((accumulator, currentValue) => accumulator + "," + currentValue);
            onSelectionChanged(selectedIDs);
        },
        [logMessageToConsole, onSelectionChanged]
    );

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

        if (!dataChangedDate) {
            if (logToConsole) {
                logMessageToConsole("Data changed date not set");
            }
            return;
        }

        if (!serviceUrl) {
            if (logToConsole) {
                logMessageToConsole("Service URL has no value");
            }
            return;
        }

        if (logToConsole) {
            logMessageToConsole("Call service using URL: " + serviceUrl);
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
    }, [dataChangedDate, serviceUrl, logMessageToConsole, logToConsole, dumpServiceResponseInConsole]);

    if (!treeData) {
        if (logToConsole) {
            logMessageToConsole("No tree data");
        }
        return <div className="react-complex-tree-widget nodata"></div>;
    }

    const treeName = "tree-" + widgetName;
    const interactionMode = toggleExpandedIconOnly ? "click-arrow-to-expand" : "click-item-to-expand";
    return (
        <div className="react-complex-tree-widget">
            <ControlledTreeEnvironment
                ref={environmentRef}
                items={treeData}
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
                onExpandItem={item => setExpandedItems([...expandedItems, item.index])}
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
