import React from 'react';
import { Drawer, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import { Link } from 'react-router-dom';

const DriverDrawer = ({ open, onClose }) => {
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
                    <ListItemButton component={Link} to="/d_applications">
                        <ListItemText primary="Manage Sponsors and Applications" />
                    </ListItemButton>
                </ListItem>

                <ListItem>
                    <ListItemButton component={Link} to="/d_catalog">
                        <ListItemText primary="Catalog" />
                    </ListItemButton>
                </ListItem>

                <ListItem>
                    <ListItemButton component={Link} to="/d_orders">
                        <ListItemText primary="Orders" />
                    </ListItemButton>
                </ListItem>

            </List>
        </Drawer>
    );
};

export default DriverDrawer;