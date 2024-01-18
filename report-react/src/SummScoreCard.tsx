/******************************************************************************
     Copyright:: 2020- IBM, Inc

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
import React from "react";
import "./SummScoreCard.scss";
import { IReport } from './IReport';
import { Grid, Column } from "@carbon/react";
interface SummScoreCardProps {
    title: string,
    report: IReport
}

export default class SummScoreCard extends React.Component<SummScoreCardProps, {}> {
    calcSummary(report: IReport) {
        let summaryResults:number[] = [];

        // JCH find unique elements that have violations and needs review issues
        let violations = (report && report.results.filter((result: any) => {
            return result.value[0] === "VIOLATION" && result.value[1] === "FAIL";
        })) || []

        let potentials = (report && report.results.filter((result: any) => {
            return result.value[0] === "VIOLATION" && (result.value[1] === "POTENTIAL" || result.value[1] === "MANUAL");
        })) || [];
        let recommendations = (report && report.results.filter((result: any) => {
            return result.value[0] === "RECOMMENDATION";
        })) || [];
        let allXpaths = (report && report.results.map((result: any) => {
            return result.path.dom;
        })) || [];
        
        let violationsPlusPotentials = violations.concat(potentials);
        let failXpaths: string[] = violationsPlusPotentials.map(result => result.path.dom);
        let failUniqueElements = new Set(failXpaths).size;

        let testedElements = 0;
        if (report) {
            if (report.testedUniqueElements) {
                testedElements = report.testedUniqueElements;
            } else if (report.passUniqueElements) {
                testedElements = new Set(allXpaths.concat(report.passUniqueElements)).size;
            }
        }
                
        summaryResults.push(violations.length);
        summaryResults.push(potentials.length);
        summaryResults.push(recommendations.length);
        summaryResults.push(100-(failUniqueElements / testedElements) * 100);
        return summaryResults;
    }

    render() {
        let summaryNumbers = this.calcSummary(this.props.report);
        let currentStatus = summaryNumbers[3].toFixed(0);

        return <div className="scoreCard" style={{border: "1px solid #9E63FB", backgroundColor:'#E8DAFF'}}>
            
            <Grid>
                <Column sm={2} md={4} lg={4} className="scLeft">
                    <h2 className="title">{this.props.title}</h2>
                    <div className="score">{currentStatus}%</div>
                    <div>Percentage of elements with no detected violations or items to review</div>
                </Column>
                <Column sm={2} md={4} lg={6}>
                    <div>
                        This report summarizes automated tests and is generated by <a 
                            href="https://www.ibm.com/able/toolkit/tools/#develop" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{color:'#002D9C'}}
                        >IBM Equal Access Tools</a>. You have to perform additional manual 
                        tests to complete accessibility assessments. Use 
                        the <a 
                            href="https://ibm.com/able/toolkit" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{color:'#002D9C'}}
                        >IBM Equal Access Toolkit</a> to guide you.
                    </div>
                    <div style={{paddingTop:"36px"}}>More resources:</div>
                    <div><a className="link" href="https://www.ibm.com/able/toolkit/develop/overview/#unit-testing" target="_blank" rel="noopener noreferrer" style={{color:'#002D9C'}}>Quick unit test for accessibility</a></div>
                    <div><a className="link" href="https://www.ibm.com/able/toolkit/verify/overview"target="_blank" rel="noopener noreferrer" style={{color:'#002D9C'}}>Full accessibility test process</a></div>
                </Column>
            </Grid>
        </div>
    }
}
