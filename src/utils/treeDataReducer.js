export default function treeDataReducer(treeData, action) {
    switch (action.type) {
        case "reload": {
            // Just return the new node set as complete result, replacing current state
            return action.data;
        }

        case "update": {
            // Start with the current state merged with updated nodes.
            const result = {
                ...treeData,
                ...action.data
            };
            // Take out deleted nodes
            if (action.deletedNodeIDs) {
                for (const deletedNodeID of action.deletedNodeIDs.split(",")) {
                    delete result[deletedNodeID];
                }
            }
            // Return result
            return result;
        }

        default: {
            throw Error("Unknown action: " + action.type);
        }
    }
}
