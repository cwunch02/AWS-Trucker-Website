import React from 'react';
import { Drawer, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import { Link } from 'react-router-dom';

const AdminDrawer = ({ open, onClose }) => {
    return (
        <Drawer anchor='left' open={open} onClose={onClose}>
            <List>
                <ListItem>
                    <ListItemButton component={Link} to="/dashboard">
                        <ListItemText primary="Home" />
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton component={Link} to="/about">
                        <ListItemText primary="About Page" />
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton component={Link} to="/user_info">
                        <ListItemText primary="User Information" />
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton component={Link} to="/sponsor_view">
                        <ListItemText primary="Sponsor View" />
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton component={Link} to="/admin_create_account">
                        <ListItemText primary="Create Accounts" />
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton component={Link} to="/admin_create_company">
                        <ListItemText primary="Create Company" />
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton component={Link} to="/reports">
                        <ListItemText primary="Report Logs" />
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton component={Link} to="/admin_salesinvoice">
                        <ListItemText primary="Sales & Invoices" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Drawer>
    );
};

export default AdminDrawer;