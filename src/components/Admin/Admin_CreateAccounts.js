import React, { useEffect, useState } from 'react';
import userpool from '../../userpool';
import { List, ListItem, ListItemText, Container, TextField, Button, Typography, MenuItem} from '@mui/material';
import {CognitoUser, CognitoUserAttribute} from "amazon-cognito-identity-js";
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import RadioGroup from '@mui/material/RadioGroup';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';


export default function AdminCreateAccount()
{
    const [USER_ID, setUSER_ID] = useState(null);
    const [SPONSOR_ID, setSponsorID] = useState(null);
    const [sponsors, setSponsors] = useState([]); 
    const [selectedSponsor, setSelectedSponsor] = useState(1);
    const [USERS, setUsers] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailErr, setEmailErr] = useState("");
    const [passwordErr, setPasswordErr] = useState("");
    const [birthday, setBirthday] = useState("");
    const [birthdayErr, setBirthdayErr] = useState("");
    const [givenName, setGivenName] = useState("");
    const [givenNameErr, setGivenNameErr] = useState("");
    const [familyName, setFamilyName] = useState("");
    const [familyNameErr, setFamilyNameErr] = useState("");
    const [signUpClicked, setSignUpClicked] = useState(false);
    const [verifyCode, setVerifyCode] = useState("");
    const [verifyCodeErr, setVerifyCodeErr] = useState("");
    const [userNameForVerification, setUserNameForVerification] = useState("");
    const [username, setUsername] = useState("");
    const AWS = require('aws-sdk');
    const [selectedAccount, setSelectedAccount] = useState('D'); // Default account type

    const handleAccountChange = (account) => {
        if(account === 'Driver')
        {
            setSelectedAccount('D');
        }
        if(account === 'Sponsor')
        {
            setSelectedAccount('S');
        }
        if(account === 'Admin')
        {
            setSelectedAccount('A');
        }
      };

    // Gets all the sponsors
    useEffect(() => {
        const fetchSponsors = async () => {
        try {
            const response = await fetch('https://team27-express.cpsc4911.com/sponsors'); 
            const sponsorData = await response.json();
            setSponsors(sponsorData.map((sponsor) => ({ value: sponsor.SPONSOR_ID, label: sponsor.SPONSOR_NAME }))); 
        } catch (error) {
            console.error('Error fetching sponsors:', error.message);
        }
        };
        fetchSponsors();
    }, []);

    const handleSponsorChange = (event) => {
        console.log(event.target.value);
        setSelectedSponsor(event.target.value);
      };

    const formInputChange = (formField, value) => {
        if (formField === "email") {
            setEmail(value);
        }
        if (formField === "password") {
            setPassword(value);
        }
        if (formField === "birthdate") {
            setBirthday(value);
        }
        if (formField === "given") {
            setGivenName(value);
        }
        if (formField === "family") {
            setFamilyName(value);
        }
    };

    const validation = () => {
        return new Promise((resolve, reject) => {
            if (email === "" && password === "") {
                setEmailErr("Email is Required");
                setPasswordErr("Password is required");
                resolve({email: "Email is required", password: "Password is required"});
            } else if (email === "") {
                setEmailErr("Email is required")
                resolve({email: "Email is required", password: ""});
            } else if (password === "") {
                setPasswordErr("Password is required")
                resolve({email: "", password: "Password is required"});
            } else if (password.length < 6) {
                setPasswordErr("Must be at least 6 characters")
                resolve({email: "", password: "Must be at least 6 characters"});
            } else {
                resolve({email: "", password: ""});
            }
            reject("");
        });
    };

    const handleClick = (e) => {
        e.preventDefault();
        setEmailErr("");
        setPasswordErr("");
        setBirthdayErr("");
        validation()
            .then((res) => {
                if (res.email === '' && res.password === '') {
                    const attributeList = [];
                    attributeList.push(
                        new CognitoUserAttribute({
                            Name: 'email',
                            Value: email,
                        }),
                        new CognitoUserAttribute({
                            Name: 'birthdate',
                            Value: birthday,
                        }),
                        new CognitoUserAttribute({
                            Name: 'given_name',
                            Value: givenName,
                        }),
                        new CognitoUserAttribute({
                            Name: 'family_name',
                            Value: familyName,
                        })
                    );
                    let username = email;
                    console.log(email);
                    setUserNameForVerification(email);
                    const client = new AWS.CognitoIdentityServiceProvider({
                        accessKeyId: 'AKIAT77CFA37WH6OB2CP',
                        secretAccessKey: '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',
                        region: 'us-east-1',
                      });
                      const params = {
                        UserPoolId: userpool.getUserPoolId(),
                        Username: username, 
                        UserAttributes: attributeList, 
                        TemporaryPassword: password // Specify a temporary password for the user
                    };

                    client.adminCreateUser(params, function(err, data) {
                        if (err) {
                            console.log('Error creating user:', err);
                        } else {
                            console.log('Username: ', data.User.Username);
                            const jsonData = {
                                USER_TYPE: selectedAccount,
                                EMAIL: email,
                                USERNAME: data.User.Username,
                                FNAME: givenName,
                                LNAME: familyName
                            };
                            // Creating the user in the user table
                            fetch('https://team27-express.cpsc4911.com/users', {
                                method: 'POST',
                                headers: {
                                'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(jsonData),
                                })
                                .then(response => {
                                if (!response.ok) {
                                    throw new Error('Failed to add user to database');
                                }
                                return response.json();
                                })
                                .then(data => {
                                // If user was successfully added to user table and coginito table, we can then add them to their respective tables
                                console.log('User successfully added to database:', data);

                                // Adds a sponsor to thier correct table
                                if(selectedAccount === 'S'){
                                    const sponsorData = {
                                        SPONSOR_COMPANY_ID: selectedSponsor,
                                        USER_ID:data.result.insertId
                                    }
                                    fetch('https://team27-express.cpsc4911.com/sponsors', {
                                    method: 'POST',
                                    headers: {
                                    'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(sponsorData),
                                    })
                                    .then(data => {
                                        console.log('Sponsor successfully added to database:', data);
                                    })
                                    .catch(error => {
                                        console.error('Error adding user:', error);
                                    });
                                }
                                if(selectedAccount === 'A'){
                                    const adminData = {
                                        USER_ID:data.result.insertId
                                    }
                                    fetch('https://team27-express.cpsc4911.com/admins', {
                                    method: 'POST',
                                    headers: {
                                    'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(adminData),
                                    })
                                    .then(data => {
                                        console.log('Admin successfully added to database:', data);
                                    })
                                    .catch(error => {
                                        console.error('Error adding user:', error);
                                    });
                                }
                                })
                                .catch(error => {
                                console.error('Error adding user:', error);
                                });
                            console.log('Successfully created user:', data);
                        }
                    });
                    setSnackbarMessage('Account created successfully');
                    setSnackbarOpen(true);
        
                    // Clear all fields
                    setEmail('');
                    setPassword('');
                    setBirthday('');
                    setGivenName('');
                    setFamilyName('');
                }
            });
        };
    
    return (
        <div className="signup">
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', marginTop: '50px'  }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
          Create Account 
        </Typography>
        <TextField
          value={email}
          onChange={(e) => formInputChange("email", e.target.value)}
          label="Email"
          error={!!emailErr} // Set error prop if there's an error message
          helperText={emailErr}
        />
        <TextField
          value={password}
          onChange={(e) => formInputChange("password", e.target.value)}
          type="password"
          label="Password"
          error={!!passwordErr} // Set error prop if there's an error message
          helperText={passwordErr}
        />
        <TextField
          value={birthday}
          onChange={(e) => formInputChange("birthdate", e.target.value)}
          label="Birthday"
          error={!!birthdayErr} // Set error prop if there's an error message
          helperText={birthdayErr}
        />
        <TextField
          value={givenName}
          onChange={(e) => formInputChange("given", e.target.value)}
          label="First Name"
          error={!!givenNameErr} // Set error prop if there's an error message
          helperText={givenNameErr}
        />
        <TextField
          value={familyName}
          onChange={(e) => formInputChange("family", e.target.value)}
          label="Last Name"
          error={!!familyNameErr} // Set error prop if there's an error message
          helperText={familyNameErr}
        />
        <FormControl>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant={selectedAccount === 'D' ? 'contained' : 'outlined'}
            onClick={() => handleAccountChange('Driver')}
          >
            Driver
          </Button>
          <Button
            variant={selectedAccount === 'S' ? 'contained' : 'outlined'}
            onClick={() => handleAccountChange('Sponsor')}
          >
            Sponsor
          </Button>
          <Button
            variant={selectedAccount === 'A' ? 'contained' : 'outlined'}
            onClick={() => handleAccountChange('Admin')}
          >
            Admin
          </Button>
        </Box>
        {selectedAccount === 'S' && (
        <Box sx = {{marginTop: '25px'}}>
          <TextField
            select
            label="Select Sponsor"
            value={selectedSponsor}
            onChange={handleSponsorChange}
            helperText="Select a sponsor for the new sponsor account"
          >
            {sponsors.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        )}
        </FormControl>
        <Button type="submit" variant="contained" onClick={handleClick}>
          Create Account
        </Button>
      </Box>
      <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
      >
          <MuiAlert
              elevation={6}
              variant="filled"
              onClose={() => setSnackbarOpen(false)}
              severity="success"
          >
              {snackbarMessage}
          </MuiAlert>
      </Snackbar>
    </div>
    )
}
