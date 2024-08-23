/******************************************************************************
  Copyright:: 2024 - Daniel Makarski
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

export let media_autoplay_controllable: Rule = {
    id: "media_autoplay_controllable",
    context: "dom:audio, dom:video",
    help: {
        "en-US": {
            "Pass_0": "media_autostart_controllable.html",
            "Potential_1": "media_autostart_controllable.html",
            "group": "media_autostart_controllable.html"
        }
    },
    messages: {
        "en-US": {
            "Pass_0": "Rule Passed",
            "Potential_1": "Verify there is a mechanism to pause or stop and control the volume for the audio that plays automatically",
            "Potential_2": "\"{0}\", \"{1}\", \"{2}\"",
            "group": "Mechanism must be available to pause or stop and control the volume of the audio that plays automatically"
        }
    },
    rulesets: [{
        "id": ["IBM_Accessibility", "WCAG_2_1", "WCAG_2_0", "WCAG_2_2"],
        "num": ["1.4.2"],
        "level": eRulePolicy.VIOLATION,
        "toolkitLevel": eToolkitLevel.LEVEL_TWO
    }],
    act: [],
    run: (context: RuleContext, options?: {}, contextHierarchies?: RuleContextHierarchy): RuleResult | RuleResult[] => {
        const ruleContext = context["dom"].node as Element;
        //skip the rule
        if (VisUtil.isNodeHiddenFromAT(ruleContext)) return null;
        let passed = true;
        if (ruleContext.hasAttribute("autostart")) {
            let val1 = ruleContext.getAttribute("autostart").toLowerCase();
            passed = val1 != 'true' && val1 != '1';
        } else if (ruleContext.hasAttribute("autoplay")) {
            let val2 = ruleContext.getAttribute("autoplay").toLowerCase();
            passed = val2 != 'true' && val2 != '1';
        }
        if (!passed && ruleContext.hasAttribute("controls")) {
            let val3 = ruleContext.getAttribute("controls").toLowerCase();
            passed = val3 == 'true' || val3 == '1';
        }
        return passed ? RulePass("Pass_0") : RulePotential("Potential_1");
    }
}