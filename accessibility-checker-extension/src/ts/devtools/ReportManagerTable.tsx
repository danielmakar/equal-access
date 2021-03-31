
import React from "react";
import { DataTable, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader,
    TableRow, TableSelectAll, TableSelectRow, TableToolbar,
    TableToolbarContent,
    TableToolbarSearch, TableBatchActions, TableBatchAction, Row
} from 'carbon-components-react';

import { Delete16, Download16 } from '@carbon/icons-react';



import "../styles/multiScanReports.scss"

interface IReportManagerTableState {
    redisplayTable: boolean, // note this is just a simulated state to force table to rerender after a delete, etc.
}

interface IReportManagerTableProps {
    layout: "main" | "sub",
    storedScans: {
        actualStoredScan: boolean;  // denotes actual stored scan vs a current scan that is kept when scans are not being stored
        isSelected: boolean;
        url: string;
        pageTitle: string;
        dateTime: number | undefined;
        scanLabel: string;
        userScanLabel: string;
        ruleSet: any;
        guidelines: any;
        reportDate: Date;
        violations: any;
        needsReviews: any;
        recommendations: any;
        elementsNoViolations: number;
        elementsNoFailures: number;
        storedScan: string;
        storedScanData: string
    }[],
    reportHandler: (typeScan: string) => void,
    setStoredScanCount: () => void,
    onKeyUp: (e:any, i:number) => void,
    clearSelectedStoredScans: () => void,
}

export default class ReportManagerTable extends React.Component<IReportManagerTableProps, IReportManagerTableState> {
    constructor(props:any) {
        super(props);
    }
    state: IReportManagerTableState = {
        redisplayTable: true
    };

    format_date(timestamp: string) {
        var date = new Date(timestamp);

        return ("00" + (date.getMonth() + 1)).slice(-2) + "/" +("00" + date.getDate()).slice(-2) + "/" +
            ("00" + date.getFullYear()).slice(-2) + ' ' +
            ("00" + date.getHours()).slice(-2) + ":" +
            ("00" + date.getMinutes()).slice(-2) + ":" +
            ("00" + date.getSeconds()).slice(-2);
    }

    downloadScanReports(selectedRows:any) {
        // set selected rows / scans in storedScans
        console.log("downloadScanReports");
        // clear old selected rows
        this.props.clearSelectedStoredScans();
        for (let i=0; i<selectedRows.length; i++) {
            if (selectedRows[i].isSelected === true) {
                this.props.storedScans[selectedRows[i].id].isSelected = true;
            }
        }

        console.log(selectedRows);
        console.log(this.props.storedScans);

        this.props.reportHandler("selected");
    }

    deleteSelected(selectedRows:any) { 
        console.log("deleteSelected");
        // get index(s) of selected row(s) to delete that match up with storedScans
        console.log("storedScans.length = ", this.props.storedScans.length)
        let indexes:number[] = [];

        // clear old selected rows
        this.props.clearSelectedStoredScans();
        for (let i=0; i<selectedRows.length; i++) {
            if (selectedRows[i].isSelected === true) {
                // this.props.storedScans[selectedRows[i].id].isSelected = true;
                indexes.push(selectedRows[i].id);
            }
        }
        console.log(indexes);

        console.log("storedScans.length = ", this.props.storedScans.length)
        console.log("Before delete = ",this.props.storedScans);

        for (var i = indexes.length -1; i >= 0; i--)
                this.props.storedScans.splice(indexes[i], 1);

        console.log("storedScans.length = ", this.props.storedScans.length)
        console.log("After delete = ",this.props.storedScans);

        // update state storedScanCount
        this.props.setStoredScanCount();

        // need to rerender scan manager
        if (this.state.redisplayTable === true) {
            this.setState({ redisplayTable:  false });
        } else if (this.state.redisplayTable === false) {
            this.setState({ redisplayTable:  true });
        }
    }    

    render() {

        const headers = [
            {
                header: 'URL', 
                key:    'url',
            },
            {
                header: 'Page title', 
                key:    'title',
            },
            {
                header: 'Date and Time', 
                key:    'date',
            },
            {
                header: 'Scan label', 
                key:    'label',
            },
            {
                header: 'Details', 
                key:    'details',
            },
        ];

        // create scan rows from stored scans

        let rows:any[] = [];
        for (let i=0; i<this.props.storedScans.length; i++) {
            rows[i] = {};
            rows[i].id = i;
            rows[i].url = this.props.storedScans[i].url;
            rows[i].title = this.props.storedScans[i].pageTitle;
            //@ts-ignore
            rows[i].date = this.format_date(this.props.storedScans[i].dateTime);
            rows[i].label = this.props.storedScans[i].scanLabel;
            rows[i].details = "view"
        }

        
        

        return (
            <React.Fragment>
            <div className="headerLeftRN" >
                
                <Row style={{marginTop:"90px",paddingLeft:"16px"}}>
                    <div className="bx--col-lg-3 bx--col-sm-4 stored-scans" style={{marginBottom:"16px"}}>
                        Stored Scans
                    </div>
                    <div className="bx--col-lg-8 bx--col-sm-6" style={{paddingLeft:0}}>
                    <div style={{overflowX:"auto"}}>
                    <DataTable size="compact" rows={rows} headers={headers} >
                        {({
                            //@ts-ignore
                            getTableProps, rows, getRowProps, selectedRows, headers, getHeaderProps, getSelectionProps,
                            //@ts-ignore
                            getToolbarProps, getBatchActionProps, onInputChange, getTableContainerProps,
                        }) => (
                            <TableContainer
                            {...getTableContainerProps()}>
                                <TableToolbar>
                                <TableBatchActions {...getBatchActionProps()}>
                                    <TableBatchAction
                                        tabIndex={getBatchActionProps().shouldShowBatchActions ? 0 : -1}
                                        renderIcon={Download16}
                                        onClick={() => this.downloadScanReports(selectedRows)}
                                    >
                                        Download
                                    </TableBatchAction>
                                    <TableBatchAction
                                        tabIndex={getBatchActionProps().shouldShowBatchActions ? 0 : -1}
                                        renderIcon={Delete16}
                                        onClick={() => this.deleteSelected(selectedRows)}
                                    >
                                        Delete
                                    </TableBatchAction>
                                </TableBatchActions>
                                <TableToolbarContent>
                                    <TableToolbarSearch
                                        tabIndex={getBatchActionProps().shouldShowBatchActions ? -1 : 0}
                                        onChange={onInputChange}
                                    />
                                </TableToolbarContent>
                            </TableToolbar>
                            <Table {...getTableProps()}>
                                <TableHead>
                                <TableRow>
                                    <TableSelectAll {...getSelectionProps()} />
                                    {headers.map((header:any, i:any) => (
                                    <TableHeader key={i} {...getHeaderProps({ header })}>
                                        {header.header}
                                    </TableHeader>
                                    ))}
                                </TableRow>
                                </TableHead>
                                <TableBody>
                                {rows.map((row:any, i:any) => (
                                    <TableRow key={i} {...getRowProps({ row })}>
                                    <TableSelectRow {...getSelectionProps({ row })} />
                                    {row.cells.map((cell:any,index:any) => (
                                        // <TableCell key={cell.id}>{cell.value}</TableCell>
                                        <TableCell key={cell.id}>
                                            {index == 0 ? <div style={{textOverflow:"ellipsis", overflow:"hidden", whiteSpace:"nowrap", direction:"rtl", width:"10rem"}}>{cell.value}</div> : ""}
                                            {index == 1 ? <div style={{textOverflow:"ellipsis", overflow:"hidden", whiteSpace:"nowrap", direction:"rtl", width:"10rem"}}>{cell.value}</div> : ""}
                                            {index == 2 ? cell.value : ""}
                                            {index == 3 ? <input style={{width:"6rem"}} type="text" placeholder={cell.value} onKeyUp={(e) => {this.props.onKeyUp(e,i)}}/> : ""}
                                            {index == 4 ? cell.value : ""}
                                        </TableCell>
                                    ))}
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                            </TableContainer>
                        )}
                        </DataTable>
                    </div> 
                    </div>   
                </Row>
            </div>
            </React.Fragment>
        )
    }
}