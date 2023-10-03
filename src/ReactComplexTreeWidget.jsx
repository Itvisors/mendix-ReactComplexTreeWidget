import { createElement, useState } from "react";

import { TreeContainer } from "./components/TreeContainer";

// eslint-disable-next-line sort-imports
import "./ui/ReactComplexTreeWidget.css";

export function ReactComplexTreeWidget({ sampleText }) {
    return <TreeContainer sampleText={sampleText} />;
}
