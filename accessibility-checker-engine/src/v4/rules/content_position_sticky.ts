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
import { VisUtil } from "../../v2/dom/VisUtil";
import { getDefinedStyles } from "../util/CSSUtil";

export let content_position_sticky: Rule = {
    id: "content_position_sticky",
    context: "dom:footer, dom:header",
    help: {
        "en-US": {
            "Pass_0": "content_position_sticky.html",
            "Potential_1": "content_position_sticky.html",
            "group": "content_position_sticky.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify that the sticky content does not hide focused elements",
            "group": "Sticky content must not hide focused elements"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_2"],
        "num": ["2.4.11"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_ONE
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as HTMLElement;
        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;

        let styles = getDefinedStyles(ruleContext);
        if (!styles["position"] || (styles["position"] !== "fixed")) 
            return RulePass("Pass_0");
        else 
            return RulePotential("Potential_1");
    }
}