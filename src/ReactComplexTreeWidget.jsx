import { TreeContainer } from "./components/TreeContainer";
import { createElement } from "react";

// eslint-disable-next-line sort-imports
import "./ui/ReactComplexTreeWidget.css";
import "react-complex-tree/lib/style-modern.css";

export function ReactComplexTreeWidget(props) {
    const logMessageToConsole = message => {
        console.info(props.name + " " + new Date().toISOString() + " " + message);
    };

    return (
        <TreeContainer
            dataChangedDate={props.dataChangeDateAttr.value}
            serviceUrl={props.serviceUrl.value}
            widgetName={props.name}
            logMessageToConsole={logMessageToConsole}
            logToConsole={props.logToConsole}
            dumpServiceResponseInConsole={props.dumpServiceResponseInConsole}
        />
    );
}
