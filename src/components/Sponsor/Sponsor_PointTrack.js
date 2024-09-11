import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Button, Box, Tabs, Tab, Select, MenuItem } from '@mui/material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Papa from 'papaparse';

function SponsorPointTrack()
{
    const [USERID, setUSERID] = useState([]);
    const [pointTrack, setPointTrack] = useState([]);
    const [currentTab, setCurrentTab] = useState('tables');
    const [currentTable, setCurrentTable] = useState('pointChange');
    const [sponsorCompany, setSponsorCompany] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedDateRange, setSelectedDateRange] = useState([null, null]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // GETS CURRENT USER FROM USER TABLE
                const userIdFromStorage = sessionStorage.getItem('USER_ID');
                if(userIdFromStorage === undefined) return
                setUSERID(userIdFromStorage);
    
                // GETS CURRENT SPONSORUSER 
                let sponsorData = await fetch(`https://team27-express.cpsc4911.com/sponsoraccounts?USER_ID=${userIdFromStorage}`); 
                sponsorData = await sponsorData.json();
                console.log(sponsorData);
    
                // get drivers associated with the current sponsor
                const driversResult = await fetch(`https://team27-express.cpsc4911.com/drivers?SPONSOR_ID=${sponsorData.SPONSOR_ID}`);
                const driversJsonResult = await driversResult.json();
                console.log(driversResult);
                setDrivers(driversJsonResult);
    
                // GETS CURRENT SPONSOR COMPANY
                const sponsorCompanyResult = await fetch(`https://team27-express.cpsc4911.com/sponsors?SPONSOR_ID=${sponsorData.SPONSOR_ID}`);
                const sponsorCompanyJson = await sponsorCompanyResult.json();
                setSponsorCompany(sponsorCompanyJson);
    
                // get point tracking log
                const pointTrackResult = await fetch(`https://team27-express.cpsc4911.com/point_track?SPONSOR_ID=${sponsorData.SPONSOR_ID}`);
                const pointTrackJsonResult = await pointTrackResult.json();
                setPointTrack(pointTrackJsonResult);
    
                // All data has been loaded
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Error fetching data. Please try again later.");
                setLoading(false);
            }
        };
    
        fetchData();
    }, []);

    const handleDateRangeChange = (newValue) => {
        setSelectedDateRange(newValue);
    };

    const handleClearDateRange = () => {
        setSelectedDateRange([null, null]);
    };

    const handleExportToCSV = () => {
        let csvData = filteredTableData;
    
        const csvString = Papa.unparse(csvData);
        const csvBlob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const csvUrl = window.URL.createObjectURL(csvBlob);
    
        const link = document.createElement('a');
        link.href = csvUrl;
        link.setAttribute('download', 'point_tracking.csv');
    
        document.body.appendChild(link);
        link.click();
    
        document.body.removeChild(link);
        window.URL.revokeObjectURL(csvUrl);
    };

    const columns = useMemo(() => {
        return [
            { accessorKey: 'AUDIT_DRIVER_FULL_NAME', header: 'Driver Name', size: 100 },
            { accessorKey: 'POINTS', header: 'Total Points', size: 100 },
            { accessorKey: 'AUDIT_ID', header: 'Audit ID', size: 100 },
            { accessorKey: 'USER_FULL_NAME', header: 'Auditor Name', size: 150},
            { accessorKey: 'AUDIT_POINTS', header: 'Point Change', size: 100 },
            { accessorKey: 'AUDIT_REASON', header: 'Reason', size: 150},
            { accessorKey: 'AUDIT_DATE', header: 'Audit Date', size: 100 }
        ];
    },);

    const filteredTableData = useMemo(() => {
        let filteredData = pointTrack;

        if (selectedDateRange[0] && selectedDateRange[1]) {
            filteredData = filteredData.filter(log => {
                const logDate = new Date(log.AUDIT_DATE);
                return logDate >= selectedDateRange[0] && logDate <= selectedDateRange[1];
            });
        }
    
        return filteredData;
    }, [currentTable, pointTrack, selectedDateRange]);

    const table = useMaterialReactTable({
        columns,
        data: filteredTableData
    });

    const renderTable = () => {
        if (currentTab === 'tables') {
            return (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
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
                        Point Tracking
                    </Typography>
                </Box>;
                {renderTable()}
            </div>
        </LocalizationProvider>
    );
    
}

export default SponsorPointTrack;