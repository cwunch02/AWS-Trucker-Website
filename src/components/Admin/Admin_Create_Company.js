import React, { useState } from 'react';
import { List, ListItem, ListItemText, Container, TextField, Button, Typography, MenuItem, Grid} from '@mui/material';
import {CognitoUser, CognitoUserAttribute} from "amazon-cognito-identity-js";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import userpool from '../../userpool';
import Box from '@mui/material/Box';

function SponsorCompanyCreation({ onNext }) {
    const [companyName, setCompanyName] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [companyNameError, setCompanyNameError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCompanyNameChange = (e) => {
        setCompanyName(e.target.value);
        setCompanyNameError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!companyName) {
            setCompanyNameError('Company name is required');
            return;
        }

        try {
            setIsLoading(true);
            const formData = {
                SPONSOR_NAME: companyName
            };
            const response = await fetch('https://team27-express.cpsc4911.com/sponsorcompany', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to submit company');
            }

            // Reset form and proceed to the next step
            setCompanyName('');
            const responseData = await response.json(); // Parse response body as JSON
            const SPONSOR_ID = responseData.sponsorCompanyId;
            onNext(companyName,SPONSOR_ID);
        } catch (error) {
            console.error('Error creating company:', error.message);
            setCompanyNameError('Failed to create company. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" marginTop={25}>
            <Box>
                <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                    <Typography variant="h4" gutterBottom>
                        Create a New Sponsor Company
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" spacing={2} gap={1}>
                            <TextField
                                type="text"
                                value={companyName}
                                onChange={handleCompanyNameChange}
                                placeholder="Enter Company Name"
                                disabled={isLoading}
                            />
                            {companyNameError && <div style={{ color: 'red' }}>{companyNameError}</div>}
                            <Button type="submit" variant="contained" disabled={isLoading}>
                                {isLoading ? 'Creating...' : 'Create Company'}
                            </Button>
                        </Box>
                    </form>
                </Box>
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
        </Box>
    );
}


// AccountCreation component
function AccountCreation({ sponsorCompanyName, SPONSOR_ID}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailErr, setEmailErr] = useState("");
    const [passwordErr, setPasswordErr] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [birthday, setBirthday] = useState("");
    const [birthdayErr, setBirthdayErr] = useState("");
    const [givenName, setGivenName] = useState("");
    const [givenNameErr, setGivenNameErr] = useState("");
    const [familyName, setFamilyName] = useState("");
    const [familyNameErr, setFamilyNameErr] = useState("");
    const [userNameForVerification, setUserNameForVerification] = useState("");


    const AWS = require('aws-sdk');

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
                                USER_TYPE: 'T',
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
                                if(true){
                                    const sponsorData = {
                                        SPONSOR_COMPANY_ID: SPONSOR_ID,
                                        USER_ID:data.result.insertId,
                                        IS_ADMIN: 1
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
                                        console.error('Error adding sponsor:', error);
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
          Create Account for {sponsorCompanyName}
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
        <Button type="submit" variant="contained" onClick={handleClick}>
          Create Sponsor Admin Account
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

// Parent component combining SponsorCompanyCreation and AccountCreation
export default function SponsorCompanyAndAccountCreation() {
    const [step, setStep] = useState(1); // 1 for sponsor company creation, 2 for account creation
    const [sponsorCompanyName, setSponsorCompanyName] = useState('');
    const [SPONSORID, setSponsorID] = useState('');

    const handleSponsorCompanyCreationNext = (companyName, SPONSOR_ID) => {
        setSponsorCompanyName(companyName);
        setSponsorID(SPONSOR_ID);
        console.log(SPONSORID);
        setStep(2); // Move to the account creation step
    };

    return (
        <div>
            {step === 1 ? (
                <SponsorCompanyCreation onNext={handleSponsorCompanyCreationNext} />
            ) : (
                <AccountCreation sponsorCompanyName={sponsorCompanyName} SPONSOR_ID={SPONSORID} />
            )}
        </div>
    );
}

