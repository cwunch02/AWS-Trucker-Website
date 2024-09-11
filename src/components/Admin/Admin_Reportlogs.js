import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Button, Box, Tabs, Tab, Select, MenuItem } from '@mui/material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Papa from 'papaparse';
import {CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis} from "recharts";

function ReportLogs() {
    const [pointLogs, setPointLogs] = useState([]);
    const [appLogs, setAppLogs] = useState([]);
    const [passLogs, setPassLogs] = useState([]);
    const [loginLogs, setLoginLogs] = useState([]);
    const [currentTab, setCurrentTab] = useState('tables');
    const [currentTable, setCurrentTable] = useState('pointChange');
    const [sponsorCompany, setSponsorCompany] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [drivers, setDrivers] = useState([]);
    const [sponsorUsers, setSponsorUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [selectedDateRange, setSelectedDateRange] = useState([null, null]);
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // GETS CURRENT USER FROM USER TABLE
                const userIdFromStorage = sessionStorage.getItem('USER_ID');
                if (userIdFromStorage === undefined) return;
    
                // gets users
                const usersResult = await fetch(`https://team27-express.cpsc4911.com/users`);
                const usersJsonResult = await usersResult.json();
                setUsers(usersJsonResult);
    
                // get drivers
                const driversResult = await fetch(`https://team27-express.cpsc4911.com/drivers`);
                const driversJsonResult = await driversResult.json();
                setDrivers(driversJsonResult);
    
                // get sponsor users
                const sponsorUsersResult = await fetch(`https://team27-express.cpsc4911.com/sponsoraccounts`);
                const sponsorUsersJsonResult = await sponsorUsersResult.json();
                setSponsorUsers(sponsorUsersJsonResult);
    
                // get sponsors
                const response = await fetch('https://team27-express.cpsc4911.com/sponsors');
                const sponsorData = await response.json();
                setSponsorCompany(sponsorData.map((sponsor) => ({ id: sponsor.SPONSOR_ID, name: sponsor.SPONSOR_NAME })));
    
                // get point change log
                const pointChangeResult = await fetch(`https://team27-express.cpsc4911.com/point_change${selectedCompany ? `?SPONSOR_ID=${selectedCompany}` : ''}`);
                const pointChangeJsonResult = await pointChangeResult.json();
                setPointLogs(pointChangeJsonResult);
    
                // get application change log
                const appChangeResult = await fetch(`https://team27-express.cpsc4911.com/application_change${selectedCompany ? `?SPONSOR_ID=${selectedCompany}` : ''}`);
                const appChangeJsonResult = await appChangeResult.json();
                setAppLogs(appChangeJsonResult);
    
                // get password change log
                const passChangeResult = await fetch(`https://team27-express.cpsc4911.com/password_change${selectedCompany ? `?SPONSOR_ID=${selectedCompany}` : ''}`);
                const passChangeJsonResult = await passChangeResult.json();
                setPassLogs(passChangeJsonResult);
    
                // get login attempt log
                const logAttemptResult = await fetch(`https://team27-express.cpsc4911.com/login_attempt${selectedCompany ? `?SPONSOR_ID=${selectedCompany}` : ''}`);
                const logAttemptJsonResult = await logAttemptResult.json();
                setLoginLogs(logAttemptJsonResult);
    
                // All data has been loaded
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Error fetching data. Please try again later.");
                setLoading(false);
            }
        };
    
        fetchData();
    }, [selectedCompany]);

    const handleTabChange = (event, newValue) => {
        setCurrentTable(newValue);
        setSelectedDateRange([null, null]);
    };

    const handleDateRangeChange = (newValue) => {
        setSelectedDateRange(newValue);
    };

    const handleClearDateRange = () => {
        setSelectedDateRange([null, null]);
    };

    const handleCompanyChange = (event) => {
        const selectedValue = event.target.value;
        setSelectedCompany(selectedValue === 'ALL COMPANIES' ? '' : selectedValue);
    };

    const handleExportToCSV = () => {
        let csvData;
        switch (currentTable) {
            case 'pointChange':
                csvData = filteredTableData.map(log => ({
                    'Audit ID': log.AUDIT_ID,
                    'Sponsor Company': log.SPONSOR_NAME,
                    'Driver ID': log.AUDIT_DRIVER,
                    'Driver Name' : log.AUDIT_DRIVER_FULL_NAME,
                    'Auditor ID' : log.USER_ID,
                    'Auditor Name' : log.USER_FULL_NAME,
                    'Point Change': log.AUDIT_POINTS,
                    'Reason': log.AUDIT_REASON,
                    'Date': log.AUDIT_DATE
                }));
                break;
            case 'appChange':
                csvData = filteredTableData.map(log => ({
                    'Audit ID': log.AUDIT_ID,
                    'Sponsor Company': log.SPONSOR_NAME,
                    'Driver ID': log.AUDIT_DRIVER,
                    'Driver Name' : log.AUDIT_DRIVER_FULL_NAME,
                    'Auditor ID' : log.USER_ID,
                    'Auditor Name' : log.USER_FULL_NAME,
                    'Status': log.AUDIT_STATUS,
                    'Reason': log.AUDIT_REASON,
                    'Date': log.AUDIT_DATE
                }));
                break;
            case 'passChange':
                csvData = filteredTableData.map(log => ({
                    'Audit ID': log.AUDIT_ID,
                    'User ID': log.AUDIT_USER,
                    'User Name' : log.AUDIT_USER_FULL_NAME,
                    'Auditor ID': log.USER_ID,
                    'Auditor Name': log.USER_FULL_NAME,
                    'Password Change Type': log.AUDIT_CHANGE_TYPE,
                    'Date': log.AUDIT_DATE
                }));
                break;
            case 'loginAttempt':
                csvData = filteredTableData.map(log => ({
                    'Audit ID': log.AUDIT_ID,
                    'Login Email': log.AUDIT_USERNAME,
                    'Status': log.AUDIT_STATUS,
                    'Date': log.AUDIT_DATE
                }));
                break;
            default:
                csvData = filteredTableData.map(log => ({
                    'Audit ID': log.AUDIT_ID,
                    'Sponsor Company': log.SPONSOR_NAME,
                    'Driver ID': log.AUDIT_DRIVER,
                    'Driver Name' : log.AUDIT_DRIVER_FULL_NAME,
                    'Auditor ID' : log.USER_ID,
                    'Auditor Name' : log.USER_FULL_NAME,
                    'Point Change': log.AUDIT_POINTS,
                    'Reason': log.AUDIT_REASON,
                    'Date': log.AUDIT_DATE
                }));
                break;
        }
    
        const csvString = Papa.unparse(csvData);
        const csvBlob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const csvUrl = window.URL.createObjectURL(csvBlob);
    
        const link = document.createElement('a');
        link.href = csvUrl;
        link.setAttribute('download', 'report_logs.csv');
    
        document.body.appendChild(link);
        link.click();
    
        document.body.removeChild(link);
        window.URL.revokeObjectURL(csvUrl);
    };

    const columns = useMemo(() => {
        switch (currentTable) {
            case 'pointChange':
                return [
                    { accessorKey: 'AUDIT_ID', header: 'Audit ID', size: 100 },
                    { accessorKey: 'SPONSOR_NAME', header: 'Sponsor Company', size: 100 },
                    { accessorKey: 'AUDIT_DRIVER', header: 'Driver ID', size: 100 },
                    { accessorKey: 'AUDIT_DRIVER_FULL_NAME', header: 'Driver Name', size: 150},
                    { accessorKey: 'USER_ID', header: 'Auditor ID', size: 100 },
                    { accessorKey: 'USER_FULL_NAME', header: 'Auditor Name', size: 150},
                    { accessorKey: 'AUDIT_POINTS', header: 'Point Change', size: 100 },
                    { accessorKey: 'AUDIT_REASON', header: 'Reason', size: 150 },
                    { accessorKey: 'AUDIT_DATE', header: 'Date', size: 150 }
                ];
            case 'appChange':
                return [
                    { accessorKey: 'AUDIT_ID', header: 'Audit ID', size: 100 },
                    { accessorKey: 'SPONSOR_NAME', header: 'Sponsor Company', size: 100 },
                    { accessorKey: 'AUDIT_DRIVER', header: 'Driver ID', size: 100 },
                    { accessorKey: 'AUDIT_DRIVER_FULL_NAME', header: 'Driver Name', size: 150},
                    { accessorKey: 'USER_ID', header: 'Auditor ID', size: 100 },
                    { accessorKey: 'USER_FULL_NAME', header: 'Auditor Name', size: 150},
                    { accessorKey: 'AUDIT_STATUS', header: 'Status', size: 150 },
                    { accessorKey: 'AUDIT_REASON', header: 'Reason', size: 150 },
                    { accessorKey: 'AUDIT_DATE', header: 'Date', size: 150 }
                ];
            case 'passChange':
                return [
                    { accessorKey: 'AUDIT_ID', header: 'Audit ID', size: 150 },
                    { accessorKey: 'USER_ID', header: 'User ID', size: 150 },
                    { accessorKey: 'USER_FULL_NAME', header: 'User Name', size: 150 },
                    { accessorKey: 'AUDIT_USER', header: 'Auditor ID', size: 150 },
                    { accessorKey: 'AUDIT_USER_FULL_NAME', header: 'Auditor Name', size: 150 },
                    { accessorKey: 'AUDIT_CHANGE_TYPE', header: 'Password Change Type', size: 200 },
                    { accessorKey: 'AUDIT_DATE', header: 'Date', size: 150 }
                ];
            case 'loginAttempt':
                return [
                    { accessorKey: 'AUDIT_ID', header: 'Audit ID', size: 150 },
                    { accessorKey: 'AUDIT_USERNAME', header: 'Login Email', size: 150 },
                    { accessorKey: 'AUDIT_STATUS', header: 'Status', size: 150 },
                    { accessorKey: 'AUDIT_DATE', header: 'Date', size: 150 }
                ];
            default:
                return [];
        }
    }, [currentTable]);

    const filteredTableData = useMemo(() => {
        let filteredData = [];
    
        switch (currentTable) {
            case 'pointChange':
                filteredData = pointLogs;
                break;
            case 'appChange':
                filteredData = appLogs;
                break;
            case 'passChange':
                filteredData = passLogs;
                break;
            case 'loginAttempt':
                filteredData = loginLogs;
                break;
            default:
                filteredData = pointLogs;
                break;
        }
    
        if (selectedDateRange[0] && selectedDateRange[1]) {
            filteredData = filteredData.filter(log => {
                const logDate = new Date(log.AUDIT_DATE);
                return logDate >= selectedDateRange[0] && logDate <= selectedDateRange[1];
            });
        }
    
        return filteredData;
    }, [currentTable, pointLogs, appLogs, passLogs, loginLogs, selectedDateRange, selectedCompany, sponsorUsers, drivers]);

    useEffect(() => {
        setData(filteredTableData.map((driver) => {
            return {
                name: driver.AUDIT_DRIVER_FULL_NAME,
                Points: driver.AUDIT_POINTS,
                date: driver.AUDIT_DATE
            }
        }))
    }, [filteredTableData]);
    const renderLineChart = () => {
        // Separate data into different arrays based on username
        const usersData = {};
        data.forEach(item => {
            if (!usersData[item.name]) {
                usersData[item.name] = [];
            }
            usersData[item.name].push(item);
        });

        // Extract unique usernames
        const users = Object.keys(usersData);

        return (
            <>
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <Select
                        value={selectedCompany}
                        onChange={handleCompanyChange}
                        displayEmpty
                        inputProps={{ 'aria-label': 'Select Sponsor Company' }}
                        style={{ minWidth: '200px', marginRight: '10px' }}
                    >
                        <MenuItem value="" disabled>
                            Select Sponsor Company
                        </MenuItem>
                        <MenuItem value="ALL COMPANIES">ALL COMPANIES</MenuItem> {/* New option */}
                        {sponsorCompany.map(company => (
                            <MenuItem key={company.id} value={company.id}>{company.name}</MenuItem>
                        ))}
                    </Select>
                    <DateRangePicker
                        startText="Start Date"
                        endText="End Date"
                        value={selectedDateRange}
                        onChange={handleDateRangeChange}
                        style={{ marginLeft: '10px' }}
                    />
                    {selectedDateRange[0] && selectedDateRange[1] && (
                        <Button onClick={handleClearDateRange} style={{ marginLeft: '10px' }}>Clear Date Range</Button>
                    )}
                </Box>
                <LineChart width={600} height={300}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {users.map((user, index) => (
                        <Line key={index} type="monotone" data={usersData[user]} dataKey="Points" name={user} stroke={`#${Math.floor(Math.random()*16777215).toString(16)}`}/>
                    ))}
                </LineChart>
            </>
        );
    };

    const table = useMaterialReactTable({
        columns,
        data: filteredTableData
    });

    const renderTable = () => {
        if (currentTab === 'tables') {
            return (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <Select
                            value={selectedCompany}
                            onChange={handleCompanyChange}
                            displayEmpty
                            inputProps={{ 'aria-label': 'Select Sponsor Company' }}
                            style={{ minWidth: '200px', marginRight: '10px' }}
                        >
                            <MenuItem value="" disabled>
                                Select Sponsor Company
                            </MenuItem>
                            <MenuItem value="ALL COMPANIES">ALL COMPANIES</MenuItem> {/* New option */}
                            {sponsorCompany.map(company => (
                                <MenuItem key={company.id} value={company.id}>{company.name}</MenuItem>
                            ))}
                        </Select>
                        <DateRangePicker
                            startText="Start Date"
                            endText="End Date"
                            value={selectedDateRange}
                            onChange={handleDateRangeChange}
                            style={{ marginLeft: '10px' }}
                        />
                        {selectedDateRange[0] && selectedDateRange[1] && (
                            <Button onClick={handleClearDateRange} style={{ marginLeft: '10px' }}>Clear Date Range</Button>
                        )}
                        <Button onClick={handleExportToCSV} style={{ marginLeft: '10px' }}>Export to CSV</Button>
                    </Box>
                    {filteredTableData.length > 0 && (
                        <MaterialReactTable table={table} />
                    )}
                </>
            );
        }
        return null;
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className='infoContainer'>
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', marginTop: '50px' }}>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                        Report Logs
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <Button
                            variant={currentTab === 'tables' ? 'contained' : 'outlined'}
                            onClick={() => setCurrentTab('tables')}
                        >
                            Report Tables
                        </Button>
                        <Button
                            variant={currentTab === 'graphs' ? 'contained' : 'outlined'}
                            onClick={() => setCurrentTab('graphs')}
                            style={{ marginLeft: '10px' }}
                        >
                            Report Graphs
                        </Button>
                    </Box>
                </Box>
                
                {currentTab === 'tables' && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <Tabs value={currentTable} onChange={handleTabChange}>
                            <Tab label="Point Change" value="pointChange" />
                            <Tab label="Application Change" value="appChange" />
                            <Tab label="Password Change" value="passChange" />
                            <Tab label="Login Attempt" value="loginAttempt" />
                        </Tabs>
                    </Box>
                )}
                {renderTable()}

                {currentTab === 'graphs' && renderLineChart()}
            </div>
        </LocalizationProvider>
    );
}

export default ReportLogs;