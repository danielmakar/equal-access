/******************************************************************************
  Copyright:: 2022- IBM, Inc
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*****************************************************************************/

import { Rule, RuleResult, RuleFail, RuleContext, RulePotential, RuleManual, RulePass, RuleContextHierarchy } from "../api/IRule";
import { eRulePolicy, eToolkitLevel } from "../api/IRule";
import { RPTUtil } from "../../v2/checker/accessibility/util/legacy";
import { FragmentUtil } from "../../v2/checker/accessibility/util/fragment";
import { DOMWalker } from "../../v2/dom/DOMWalker";
import { DOMUtil } from "../../v2/dom/DOMUtil";
import { VisUtil } from "../../v2/dom/VisUtil";
import { ARIADefinitions } from "../../v2/aria/ARIADefinitions";

export let input_label_exists: Rule = {
    id: "input_label_exists",
    context: "aria:button,aria:checkbox,aria:combobox,aria:listbox,aria:menuitemcheckbox,aria:menuitemradio,aria:radio,aria:searchbox,aria:slider,aria:spinbutton,aria:switch,aria:textbox,aria:progressbar,dom:input[type=file],dom:output,dom:meter,dom:input[type=password]",
    //dependencies: ["aria_role_redundant", "aria_role_valid"],
    refactor: {
        "WCAG20_Input_ExplicitLabel": {
            "Pass_0": "Pass_0",
            "Fail_1": "Fail_1",
            "Fail_2": "Fail_2"}
    },
    help: {
        "en-US": {
            "Pass_0": "input_label_exists.html",
            "Fail_1": "input_label_exists.html",
            "Fail_2": "input_label_exists.html",
            "group": "input_label_exists.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Fail_1": "Form control element <{0}> has no associated label",
            "Fail_2": "Form control with \"{0}\" role has no associated label",
            "group": "Each form control must have an associated label"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["3.3.2", "4.1.2"], /* remove 1.1.1 mapping, keep 4.1.2 */
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    // TODO: ACT: https://github.com/IBMa/equal-access/issues/756
    act: ["97a4e1", "e086e5"],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) {
            return null;
        }

        let nodeName = ruleContext.nodeName.toLowerCase();
        //ignore datalist element check since it will be part of a input element or hidden by default
        if (nodeName === 'datalist')
            return null;
        
        // Determine the input type
        let passed = true;
        let type = "text";
        if (nodeName == "input" && ruleContext.hasAttribute("type")) {
            type = ruleContext.getAttribute("type").toLowerCase();
        } else if (nodeName === "button" || RPTUtil.hasRoleInSemantics(ruleContext, "button")) {
            type = "buttonelem";
        }
        if (nodeName == "input" && type == "") {
            type = "text";
        }
        if (type === "image") {
            // Handled by input_label_existsImage
            return null;
        }

        let POF = -1;
        let textTypes = [
            "text", "file", "password",
            "checkbox", "radio",
            "search", "tel", "url", "email",  //HTML 5. Note: type = "hidden" doesn't require text
            "date", "number", "range", //HTML 5. type = "image" is checked in g10.
            "time", "color"
        ]
        let buttonTypes = [
            "button", "reset", "submit"
        ]
        let buttonTypesWithDefaults = ["reset", "submit"]; // 'submit' and 'reset' have visible defaults.
        if (textTypes.indexOf(type) !== -1) { // If type is in the list
            // Get only the non-hidden labels for elements, in the case that a label is hidden then it is a violation
            // Note: label[for] does not work for ARIA defined inputs
            let labelElem = ruleContext.hasAttribute("role") ? null : RPTUtil.getLabelForElementHidden(ruleContext, true);
            let hasLabelElemContent = false;
            if (labelElem) {
                if (RPTUtil.hasInnerContentHidden(labelElem)) {
                    hasLabelElemContent = true;
                } else if ((labelElem.getAttribute("aria-label") || "").trim().length > 0) {
                    hasLabelElemContent = true;
                } else if (labelElem.hasAttribute("aria-labelledby")) {
                    let labelledByElem = FragmentUtil.getById(labelElem, labelElem.getAttribute('aria-labelledby'));
                    if (labelledByElem && !DOMUtil.sameNode(labelledByElem, labelElem) && RPTUtil.hasInnerContent(labelledByElem)) {
                        hasLabelElemContent = true;
                    }
                }
            }
            passed = (!!labelElem && hasLabelElemContent) ||
                (!labelElem && RPTUtil.attributeNonEmpty(ruleContext, "title") || RPTUtil.attributeNonEmpty(ruleContext, "placeholder")) ||
                RPTUtil.getAriaLabel(ruleContext).trim().length > 0 || RPTUtil.hasImplicitLabel(ruleContext);
            if (!passed) POF = 2 + textTypes.indexOf(type);
            
        } else if (buttonTypes.indexOf(type) !== -1) { // If type is a button
            if (buttonTypesWithDefaults.indexOf(type) !== -1 && !ruleContext.hasAttribute("value")) {
                // 'submit' and 'reset' have visible defaults so pass if there is no 'value' attribute
                passed = true;
            } else {
                passed = RPTUtil.attributeNonEmpty(ruleContext, "value") || RPTUtil.hasAriaLabel(ruleContext) || RPTUtil.attributeNonEmpty(ruleContext, "title");
                if (!passed) POF = 2 + textTypes.length + buttonTypes.indexOf(type);
            }
        } else if (type == "buttonelem") {
            // If I am an image and I have alt text - accessibility-web-engine#269
            let bAlt = false;
            if (ruleContext.nodeName.toLowerCase() === "img" && ruleContext.hasAttribute("alt")) {
                let alt = ruleContext.getAttribute("alt");
                if (alt.trim().length === 0) {
                    bAlt = false;
                } else {
                    bAlt = true;
                }
            };
            passed = RPTUtil.hasInnerContentHidden(ruleContext) || RPTUtil.hasAriaLabel(ruleContext) || bAlt || RPTUtil.attributeNonEmpty(ruleContext, "title");

            if (!passed) POF = 2 + textTypes.length + buttonTypes.length + 1;
        }

        //check if a native button is labelled
        if (!passed && nodeName == "button") {
             if (RPTUtil.hasImplicitLabel(ruleContext))
                passed = true;
             else {
                let label = RPTUtil.getLabelForElement(ruleContext);
                if (label && RPTUtil.hasInnerContentHidden(label))
                    passed = true;    
             }    
        }

        // Rpt_Aria_ValidIdRef determines if the aria-labelledby id points to a valid element
        if (!passed && (buttonTypes.indexOf(type) !== -1)) {
            if (ruleContext.hasAttribute("class") && ruleContext.getAttribute("class") == "dijitOffScreen" && DOMWalker.parentElement(ruleContext).hasAttribute("widgetid")) {
                // Special handling for dijit buttons
                let labelId = DOMWalker.parentElement(ruleContext).getAttribute("widgetid") + "_label";
                let label = FragmentUtil.getById(ruleContext, labelId);
                if (label != null) {
                    passed = RPTUtil.hasInnerContentHidden(label);
                    // This means I failed above also
                    if (!passed) POF = 2 + textTypes.length + buttonTypes.length + 4 + buttonTypes.indexOf(type);
                }
            }
        }

        if (!passed && nodeName == "optgroup") {
            passed = RPTUtil.attributeNonEmpty(ruleContext, "label");
            if (!passed) POF = 2 + textTypes.length + buttonTypes.length + 2;
        }
        if (!passed && nodeName == "option") {
            // Is a non-empty value attribute also enough for an option element?
            passed = RPTUtil.attributeNonEmpty(ruleContext, "label") || ruleContext.innerHTML.trim().length > 0;
            if (!passed) POF = 2 + textTypes.length + buttonTypes.length + 3;
        } 
        
        if (!passed)
            passed = RPTUtil.getAriaLabel(ruleContext).trim().length > 0 || RPTUtil.attributeNonEmpty(ruleContext, "title");
                
        if (!passed) {
            // check aria role to figure out if the accessible name can be from content 
            const roles = RPTUtil.getRoles(ruleContext, true);
            //when multiple roles specified, only the first valid role (guaranteed by dependencies) is applied, and the others just as fallbacks
            if (ARIADefinitions.designPatterns[roles[0]] && ARIADefinitions.designPatterns[roles[0]].nameFrom && ARIADefinitions.designPatterns[roles[0]].nameFrom.includes("contents"))
                passed = RPTUtil.hasInnerContentHidden(ruleContext);
        }

        if (passed) {
            return RulePass("Pass_0");
        } else if (ruleContext.hasAttribute("role") && ruleContext.getAttribute("role").trim().length > 0) {
            return RuleFail("Fail_2", ruleContext.getAttribute("role").split(" "));
        } else {
            return RuleFail("Fail_1", [nodeName]);
        }
    }
}
