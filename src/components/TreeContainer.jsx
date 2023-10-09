import { ControlledTreeEnvironment, Tree } from "react-complex-tree";
import { createElement, useEffect, useState } from "react";

export function TreeContainer({
    dataChangedDate,
    serviceUrl,
    widgetName,
    logMessageToConsole,
    logToConsole,
    dumpServiceResponseInConsole
}) {
    const [treeData, setTreeData] = useState(null);
    const [focusedItem, setFocusedItem] = useState();
    const [expandedItems, setExpandedItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

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
                setTreeData(newTreeData);
            };

            // const updateTree = () => {
            //     const newTreeData = createTreeDataObject();
            //     setTreeData(prevTreeData => ({
            //         ...treeData,
            //         newTreeData
            //     }));
            //     // Update the treeData state
            // };

            if (logToConsole) {
                logMessageToConsole("Received " + data.nodes.length + " nodes, action: " + data.action);
                if (dumpServiceResponseInConsole) {
                    logMessageToConsole("Received service response:");
                    console.info(JSON.stringify(data));
                }
            }
            switch (data.action) {
                case "reload":
                    reloadTree(data);
                    break;

                // case "update":
                //     updateTree(data);
                //     break;

                default:
                    console.warn(" React complex tree unknown action: " + data.action);
                    break;
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
    return (
        <div className="react-complex-tree-widget">
            <ControlledTreeEnvironment
                items={treeData}
                getItemTitle={item => item.data}
                viewState={{
                    [treeName]: {
                        focusedItem,
                        expandedItems,
                        selectedItems
                    }
                }}
                onFocusItem={item => setFocusedItem(item.index)}
                onExpandItem={item => setExpandedItems([...expandedItems, item.index])}
                onCollapseItem={item =>
                    setExpandedItems(expandedItems.filter(expandedItemIndex => expandedItemIndex !== item.index))
                }
                onSelectItems={items => setSelectedItems(items)}
            >
                <Tree treeId={treeName} rootItem="root" />
            </ControlledTreeEnvironment>
        </div>
    );
}
