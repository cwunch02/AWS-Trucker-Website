import React, { useEffect, useState } from 'react';
import userpool from '../../userpool';
import { List, ListItem, ListItemText, Container, TextField, Button, Box, Typography} from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import {CognitoUser, CognitoUserAttribute} from "amazon-cognito-identity-js";
import AWS from 'aws-sdk';

export default function SponsorPromotion()
{
    const [USER_ID, setUSER_ID] = useState(null);
    const [SPONSOR_ID, setSponsorID] = useState(null);
    const [USERS, setUsers] = useState(null);
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
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [signUpClicked, setSignUpClicked] = useState(false);
    const [verifyCode, setVerifyCode] = useState("");
    const [verifyCodeErr, setVerifyCodeErr] = useState("");
    const [userNameForVerification, setUserNameForVerification] = useState("");
    const [username, setUsername] = useState("");
    const AWS = require('aws-sdk');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedUserID = sessionStorage.getItem('USER_ID');
                if (!storedUserID) return; // Return early if USER_ID is not available in sessionStorage
                setUSER_ID(storedUserID);
                const sponsorResponse = await fetch(`https://team27-express.cpsc4911.com/sponsoraccounts?USER_ID=${storedUserID}`);
                const sponsorData = await sponsorResponse.json();
                setSponsorID(sponsorData.SPONSOR_ID);
                return;
            } catch (error) {
                console.error('Error fetching user data:', error.message);
            }
          };
          fetchUserData();
    }, []);

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
                                USER_TYPE: 'S',
                                EMAIL: email,
                                USERNAME: data.User.Username,
                                FNAME: givenName,
                                LNAME: familyName
                            };
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
                                console.log('User successfully added to database:', data);
                                    const sponsorData = {
                                        SPONSOR_COMPANY_ID: SPONSOR_ID,
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
                    Create Sponsor Account 
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
                <div className="formfield">
                    <Button type="submit" variant="contained" onClick={handleClick}>Create Sponsor Account</Button>
                </div>
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
