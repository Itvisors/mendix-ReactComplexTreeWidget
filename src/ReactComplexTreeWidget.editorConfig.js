import { hidePropertyIn } from "@mendix/pluggable-widgets-tools";

/**
 * @param {object} values
 * @param {Properties} defaultProperties
 * @param {("web"|"desktop")} target
 * @returns {Properties}
 */
export function getProperties(values, defaultProperties, target) {
    // Do the values manipulation here to control the visibility of properties in Studio and Studio Pro conditionally.

    // Hide rename properties
    if (!values.allowNodeRename) {
        hidePropertyIn(defaultProperties, values, "renamedNodeIDAttr");
        hidePropertyIn(defaultProperties, values, "newNodeNameAttr");
        hidePropertyIn(defaultProperties, values, "onNodeRenamedAction");
    }

    // Hide drag/drop properties
    if (!values.allowDragReordering && !values.allowDragMove) {
        hidePropertyIn(defaultProperties, values, "draggedNodeIDsAttr");
        hidePropertyIn(defaultProperties, values, "dropTargetAttr");
        hidePropertyIn(defaultProperties, values, "onDropAction");
    }

    return defaultProperties;
}

/**
 * @param {Object} values
 * @returns {Problem[]} returns a list of problems.
 */
export function check(values) {
    /** @type {Problem[]} */
    const errors = [];
    // Add errors to the above array to throw errors in Studio and Studio Pro.

    // Rename properties are required when renaming is allowed
    if (values.allowNodeRename) {
        if (!values.renamedNodeIDAttr) {
            errors.push({
                property: "renamedNodeIDAttr",
                message: "Renamed node ID is required when node renaming is allowed"
            });
        }
        if (!values.newNodeNameAttr) {
            errors.push({
                property: "newNodeNameAttr",
                message: "New node name is required when node renaming is allowed"
            });
        }
        if (!values.onNodeRenamedAction) {
            errors.push({
                property: "onNodeRenamedAction",
                message: "On node renamed action is required when node renaming is allowed"
            });
        }
    }

    if (values.allowDragReordering || values.allowDragMove) {
        if (!values.draggedNodeIDsAttr) {
            errors.push({
                property: "draggedNodeIDsAttr",
                message: "Dragged node IDs is required when drag/drop is allowed"
            });
        }
        if (!values.dropTargetAttr) {
            errors.push({
                property: "dropTargetAttr",
                message: "Drop target info is required when drag/drop is allowed"
            });
        }
        if (!values.onDropAction) {
            errors.push({
                property: "onDropAction",
                message: "On drop action is required when drag/drop is allowed"
            });
        }
    }
    return errors;
}

// /**
//  * @param {object} values
//  * @param {boolean} isDarkMode
//  * @param {number[]} version
//  * @returns {object}
//  */
// export function getPreview(values, isDarkMode, version) {
//     // Customize your pluggable widget appearance for Studio Pro.
//     return {
//         type: "Container",
//         children: []
//     };
// }

// /**
//  * @param {Object} values
//  * @param {("web"|"desktop")} platform
//  * @returns {string}
//  */
// export function getCustomCaption(values, platform) {
//     return "ReactComplexTreeWidget";
// }
