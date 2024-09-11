import React, {useEffect, useMemo, useState} from "react";
import {Box, Button, Typography} from "@mui/material";
import {MaterialReactTable, useMaterialReactTable} from "material-react-table";
import {DateRangePicker} from "@mui/x-date-pickers-pro";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";


function Sponsor_Orders() {
    const [USERID, setUSERID] = useState([]);
    const [orderLogs, setOrderLogs] = useState([]);
    const [sponsorCompany, setSponsorCompany] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [error, setError] = useState(null);
    const [selectedDateRange, setSelectedDateRange] = useState([null, null]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // GETS CURRENT USER FROM USER TABLE
                const userIdFromStorage = sessionStorage.getItem('USER_ID');
                if (userIdFromStorage === undefined) return
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

                const driverOrdersResult = await fetch(`https://team27-express.cpsc4911.com/orders?SPONSOR_ID=${sponsorData.SPONSOR_ID}`);
                const driverOrdersJSON = await driverOrdersResult.json();
                setOrderLogs(driverOrdersJSON);

            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Error fetching data. Please try again later.");
            }
        }
        fetchData();
    }, []);

    const handleDateRangeChange = (newValue) => {
        setSelectedDateRange(newValue);
    };

    const handleClearDateRange = () => {
        setSelectedDateRange([null, null]);
    };

    const handleDelete = async(id) => {
        await fetch(`https://team27-express.cpsc4911.com/orders?ORDER_ID=${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        const userIdFromStorage = sessionStorage.getItem('USER_ID');
        if (userIdFromStorage === undefined) return
        setUSERID(userIdFromStorage);

        let sponsorData = await fetch(`https://team27-express.cpsc4911.com/sponsoraccounts?USER_ID=${userIdFromStorage}`);
        sponsorData = await sponsorData.json();


        const driverOrdersResult = await fetch(`https://team27-express.cpsc4911.com/orders?SPONSOR_ID=${sponsorData.SPONSOR_ID}`);
        const driverOrdersJSON = await driverOrdersResult.json();
        setOrderLogs(driverOrdersJSON);
    }

    const filteredTableData = useMemo(() => {
        let filteredData = orderLogs;

        if (selectedDateRange[0] && selectedDateRange[1]) {
            filteredData = filteredData.filter(log => {
                const logDate = new Date(log.ORDER_DATE);
                return logDate >= selectedDateRange[0] && logDate <= selectedDateRange[1];
            });
        }

        return filteredData;
    }, [orderLogs, selectedDateRange]);

    const columns = useMemo(() => {
        return [
            { accessorKey: 'ORDER_ID', header: 'Order ID', size: 100 },
            { accessorKey: 'DOLLAR_AMOUNT', header: 'Dollar Total of Order', size: 100 },
            { accessorKey: 'POINT_TOTAL', header: 'Point Total of Order', size: 150},
            { accessorKey: 'ORDER_DATE', header: 'Date of Order', size: 100 },
            { accessorKey: 'FULLNAME', header: 'Driver Name', size: 150},
            { accessorKey: 'SPONSOR_NAME', header: 'Sponsor\'s Catalog', size: 100 },
            {
                accessorKey: 'DELETE', // Added accessorKey
                header: 'Actions',      // Added header
                size: 100,
                Cell: ({ row }) => <Button onClick={() => handleDelete(row.original.ORDER_ID)}>Delete</Button>,
            }
        ];
    },[]);

    const table = useMaterialReactTable({
        columns,
        data: filteredTableData
    });

    const renderTable = () => {
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
                </Box>
                {filteredTableData.length > 0 && (
                    <MaterialReactTable table={table} />
                )}
            </>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className='infoContainer'>
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', marginTop: '50px' }}>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                        Orders
                    </Typography>
                </Box>;
                {renderTable()}
            </div>
        </LocalizationProvider>
    );
}
export default Sponsor_Orders;