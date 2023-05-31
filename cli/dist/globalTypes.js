export var ScrapperActions;
(function (ScrapperActions) {
    ScrapperActions["SCRAPE_CONTENT"] = "SCRAPE_CONTENT";
    ScrapperActions["INPUT_VALUE"] = "INPUT_VALUE";
    ScrapperActions["GO_TO_URL"] = "GO_TO_URL";
    ScrapperActions["SCRAPE_CONTENT_FROM_URLS"] = "SCRAPE_CONTENT_FROM_URLS";
    ScrapperActions["CLICK_AND_CONTINUE"] = "CLICK_AND_CONTINUE";
    ScrapperActions["CLICK_AND_SCRAPE_CONTENT"] = "CLICK_AND_SCRAPE_CONTENT";
    ScrapperActions["INPUT_VALUE_AND_ENTER"] = "INPUT_VALUE_AND_ENTER";
})(ScrapperActions || (ScrapperActions = {}));
export var CustomFieldsEnum;
(function (CustomFieldsEnum) {
    CustomFieldsEnum["dateScrapped"] = "dateScrapped";
})(CustomFieldsEnum || (CustomFieldsEnum = {}));
export var MessageEvents;
(function (MessageEvents) {
    MessageEvents["init"] = "init";
    MessageEvents["updateCSSPath"] = "update-css-path";
    MessageEvents["applyActions"] = "apply-actions";
    MessageEvents["unsavedChanges"] = " unsaved-changes";
})(MessageEvents || (MessageEvents = {}));
export var ResponseEvents;
(function (ResponseEvents) {
    ResponseEvents["addCSSPath"] = "add-css-path";
    ResponseEvents["initSuccess"] = "init-success";
    ResponseEvents["checkForUnsavedChanges"] = "check-for-unsaved-changes";
    ResponseEvents["pageLoaded"] = "page-loaded";
})(ResponseEvents || (ResponseEvents = {}));
export const isLink = (node) => {
    return node.nodeType === 'a';
};
export const isInput = (node) => {
    return ['input', 'textarea', 'select'].includes(node.nodeType);
};
