import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Button, Box, Tabs, Tab, Select, MenuItem } from '@mui/material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Papa from 'papaparse';

function AdminSalesInvoice()
{
    const [currentTab, setCurrentTab] = useState('tables');
    const [currentTable, setCurrentTable] = useState('orders');
    const [sponsorCompany, setSponsorCompany] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedDriver, setSelectedDriver] = useState('');
    const [orders, setOrders] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [sponsorUsers, setSponsorUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedDateRange, setSelectedDateRange] = useState([null, null]);

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
                setUsers(usersJsonResult.map((user) => ({id: user.USER_ID, name: user.FNAME + ' ' + user.LNAME})));
    
                // Filter users by USER_TYPE 'd'
                const filteredUsers = usersJsonResult.filter(user => user.USER_TYPE === 'D');
                setFilteredUsers(filteredUsers.map((user) => ({ id: user.USER_ID, name: user.FNAME + ' ' + user.LNAME })));
    
                // get sponsor users
                const sponsorUsersResult = await fetch(`https://team27-express.cpsc4911.com/sponsoraccounts`);
                const sponsorUsersJsonResult = await sponsorUsersResult.json();
                setSponsorUsers(sponsorUsersJsonResult);
    
                // get sponsors
                const response = await fetch('https://team27-express.cpsc4911.com/sponsors');
                const sponsorData = await response.json();
                setSponsorCompany(sponsorData.map((sponsor) => ({ id: sponsor.SPONSOR_ID, name: sponsor.SPONSOR_NAME })));
    
                // Calculate START_DATE and END_DATE based on selected date range
                const [startDate, endDate] = selectedDateRange;
    
                // get orders based on selected driver and sponsor
                const ordersResult = await fetch(`https://team27-express.cpsc4911.com/orders${selectedCompany ? `?SPONSOR_ID=${selectedCompany}` : ''}${selectedDriver ? `&USER_ID=${selectedDriver}` : ''}`);
                const ordersJsonResult = await ordersResult.json();
                setOrders(ordersJsonResult);
    
                const invoicesResult = await fetch(`https://team27-express.cpsc4911.com/invoices${selectedCompany ? `?SPONSOR_ID=${selectedCompany}` : ''}`);
                const invoicesJsonResult = await invoicesResult.json();
                setInvoices(invoicesJsonResult);
    
                // All data has been loaded
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Error fetching data. Please try again later.");
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedCompany, selectedDriver, selectedDateRange]);

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

    const handleDriverChange = (event) => {
        const selectedValue = event.target.value;
        setSelectedDriver(selectedValue === 'ALL DRIVERS' ? '' : selectedValue);
    };

    const handleExportToCSV = () => {
        let csvData = [];
        switch (currentTable) {
            case 'orders':
                csvData = filteredTableData.map(order => ({
                    'Order ID': order.ORDER_ID,
                    'Sponsor Company': order.SPONSOR_NAME,
                    'Driver ID': order.USER_ID,
                    'Driver Name': order.FULLNAME,
                    'Points Redeemed': order.POINT_TOTAL,
                    'Cost': order.DOLLAR_AMOUNT,
                    'Date': order.ORDER_DATE
                }));
                break;
            case 'invoices':
                csvData = filteredTableData.map(invoice => ({
                    'Sponsor Company': invoice.SPONSOR_NAME,
                    'Driver ID': invoice.USER_ID,
                    'Driver Name': invoice.FULLNAME,
                    'Total Points Redeemed': invoice.POINTSREDEEMED,
                    'Total Cost': invoice.TOTALSPENT,
                    'Date': invoice.ORDER_DATE
                }));
                break;
            default:
                break;
        }
    
        const csvString = Papa.unparse(csvData);
        const csvBlob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const csvUrl = window.URL.createObjectURL(csvBlob);
    
        const link = document.createElement('a');
        link.href = csvUrl;
        link.setAttribute('download', 'sales_invoice.csv');
    
        document.body.appendChild(link);
        link.click();
    
        document.body.removeChild(link);
        window.URL.revokeObjectURL(csvUrl);
    };

    const columns = useMemo(() => {
        switch (currentTable) {
            case 'orders':
                return [
                    { accessorKey: 'ORDER_ID', header: 'Order ID', size: 100 },
                    { accessorKey: 'SPONSOR_NAME', header: 'Sponsor Company', size: 100 },
                    { accessorKey: 'USER_ID', header: 'Driver ID', size: 100 },
                    { accessorKey: 'FULLNAME', header: 'Driver Name', size: 150},
                    { accessorKey: 'POINT_TOTAL', header: 'Points Redeemed', size: 100 },
                    { accessorKey: 'DOLLAR_AMOUNT', header: 'Cost', size: 150 },
                    { accessorKey: 'ORDER_DATE', header: 'Date', size: 150 }
                ];
            case 'invoices':
                return [
                    { accessorKey: 'SPONSOR_NAME', header: 'Sponsor Company', size: 100 },
                    { accessorKey: 'USER_ID', header: 'Driver ID', size: 100 },
                    { accessorKey: 'FULLNAME', header: 'Driver Name', size: 150},
                    { accessorKey: 'POINTSREDEEMED', header: 'Total Points Redeemed', size: 100 },
                    { accessorKey: 'TOTALSPENT', header: 'Total Cost', size: 150 },
                    
                    { accessorKey: 'ORDER_DATE', header: 'Date', size: 150 }
                ]
            default:
                return [];
        }
    }, [currentTable]);

    const filteredTableData = useMemo(() => {
        let filteredData = [];
        switch (currentTable) {
            case 'orders':
                filteredData = orders.filter(order => {
                    const orderDate = new Date(order.ORDER_DATE);
                    return (
                        (!selectedDateRange[0] || orderDate >= selectedDateRange[0]) &&
                        (!selectedDateRange[1] || orderDate <= selectedDateRange[1]) &&
                        (!selectedDriver || order.USER_ID === selectedDriver) &&
                        (!selectedCompany || order.SPONSOR_ID === selectedCompany)
                    );
                });
                break;
            case 'invoices':
                filteredData = orders.filter(order => {
                    const orderDate = new Date(order.ORDER_DATE);
                    return (
                        (!selectedDateRange[0] || orderDate >= selectedDateRange[0]) &&
                        (!selectedDateRange[1] || orderDate <= selectedDateRange[1]) &&
                        (!selectedDriver || order.USER_ID === selectedDriver) &&
                        (!selectedCompany || order.SPONSOR_ID === selectedCompany)
                    );
                });
                filteredData = filteredData.reduce((invoices, order) => {
                    const key = `${order.SPONSOR_NAME}_${order.USER_ID}`;
                    if (!invoices[key]) {
                        invoices[key] = {
                            ...order,
                            POINTSREDEEMED: order.POINT_TOTAL,
                            TOTALSPENT: order.DOLLAR_AMOUNT
                        };
                    } else {
                        invoices[key].POINTSREDEEMED += order.POINT_TOTAL;
                        invoices[key].TOTALSPENT += order.DOLLAR_AMOUNT;
                    }
                    return invoices;
                }, {});
                filteredData = Object.values(filteredData);
                break;
            default:
                filteredData = orders;
                break;
        }
    
        return filteredData;
    }, [currentTable, orders, selectedDateRange, selectedDriver, selectedCompany]);
    
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
                            <MenuItem value="ALL COMPANIES">ALL COMPANIES</MenuItem>
                            {sponsorCompany.map(company => (
                                <MenuItem key={company.id} value={company.id}>{company.name}</MenuItem>
                            ))}
                        </Select>
                        {currentTable === 'orders' && (
                            <Select
                                value={selectedDriver}
                                onChange={handleDriverChange}
                                displayEmpty
                                inputProps={{ 'aria-label': 'Select Driver' }}
                                style={{ minWidth: '200px', marginRight: '10px' }}
                            >
                                <MenuItem value="" disabled>
                                    Select Driver
                                </MenuItem>
                                <MenuItem value="ALL DRIVERS">ALL DRIVERS</MenuItem>
                                {filteredUsers.map(user => (
                                    <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
                                ))}
                            </Select>
                        )}
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
                        Sales and Invoices
                    </Typography>
                </Box>
                
                {currentTab === 'tables' && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <Tabs value={currentTable} onChange={handleTabChange}>
                            <Tab label="Sales" value="orders" />
                            <Tab label="Invoices" value="invoices" />
                        </Tabs>
                    </Box>
                )}
                {renderTable()}
            </div>
        </LocalizationProvider>
    );
}

export default AdminSalesInvoice;