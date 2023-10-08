import { StaticTreeDataProvider, Tree, UncontrolledTreeEnvironment } from "react-complex-tree";
import { createElement, useEffect, useState } from "react";

export function TreeContainer({
    dataChangedDate,
    serviceUrl,
    logMessageToConsole,
    logToConsole,
    dumpServiceResponseInConsole
}) {
    const [treeData, setTreeData] = useState(null);

    useEffect(() => {
        const processDataFromService = data => {
            if (logToConsole) {
                logMessageToConsole("Received service response");
                if (dumpServiceResponseInConsole) {
                    console.info(JSON.stringify(data));
                }
            }
            if (logToConsole) {
                logMessageToConsole("Received " + data.nodes.length + " nodes");
            }
            const newTreeData = {};
            for (const node of data.nodes) {
                newTreeData[node.index] = node;
                if (node.children) {
                    newTreeData[node.index].children = node.children.split(",");
                }
            }
            setTreeData(newTreeData);
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

    if (logToConsole) {
        logMessageToConsole("Render tree");
        console.info(JSON.stringify(treeData));
    }
    return (
        <div className="react-complex-tree-widget">
            <UncontrolledTreeEnvironment
                dataProvider={new StaticTreeDataProvider(treeData, (item, data) => ({ ...item, data }))}
                getItemTitle={item => item.data}
                viewState={{}}
            >
                <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" />
            </UncontrolledTreeEnvironment>
        </div>
    );
}
