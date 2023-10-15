export default function treeDataReducer(treeData, action) {
    switch (action.type) {
        case "reload": {
            // Just return the new node set as complete result, replacing current state
            return {
                ...treeData,
                data: action.data
            };
        }

        case "update": {
            // Start with the current state merged with updated nodes.
            const result = {
                ...treeData
            };
            result.data = {
                ...result.data,
                ...action.data
            };
            // Take out deleted nodes
            if (action.deletedNodeIDs) {
                for (const deletedNodeID of action.deletedNodeIDs.split(",")) {
                    delete result.data[deletedNodeID];
                }
            }
            // Return result
            return result;
        }

        case "setDataChangedDate": {
            // Update the data changed date
            return {
                ...treeData,
                dataChangedDate: action.dataChangedDate
            };
        }

        default: {
            throw Error("Unknown action: " + action.type);
        }
    }
}
