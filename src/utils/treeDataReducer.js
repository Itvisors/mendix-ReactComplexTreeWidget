export default function treeDataReducer(treeData, action) {
    switch (action.type) {
        case "reload": {
            return action.data;
        }

        case "update": {
            return {
                ...treeData,
                ...action.data
            };
        }

        default: {
            throw Error("Unknown action: " + action.type);
        }
    }
}
