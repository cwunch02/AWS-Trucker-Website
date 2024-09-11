import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { updateUserAttribute, fetchUserAttributes, confirmUserAttribute } from 'aws-amplify/auth';
import {Button, TextField, Typography, CircularProgress, Box} from "@mui/material";
import userpool from '../userpool';
import {CognitoUser, CognitoUserAttribute} from "amazon-cognito-identity-js";
const AWS = require('aws-sdk');

const Profile = () => {
        const [userAttributes, setUserAttributes] = useState(null);
        const [updateUser, setUpdateUser] = useState(false);
        const [newUserAttribute, setNewUserAttribute] = useState("");
        const [newUserAttributeErr, setNewUserAttributeErr] = useState("");
        const [client, setClient] = useState("");
        const [USER_ID,setUserId] = useState("");
        const [userDate, setCurrentUser] = useState("");
        const [isLoading, setIsLoading] = useState(true);
        const [birthDayErr, setBirthdayErr] = useState('');
        const [fNameErr, setfNameErr] = useState('');
        const [lNameErr, setlNameErr] = useState('');
        const [email, setEmail] = useState('');
        const [fname, setFname] = useState('');
        const [lname, setLname] = useState('');
        const [birthday, setBirthday] = useState('');
        const [newPassword, setNewPassword] = useState('');
        const [showPassword, setShowPassword] = useState(false);
        const [passwordErr, setPasswordErr] = useState('');
        // Gets user attributes
        useEffect(() => {
            const fetchUserAttributes = async () => {
                try {
                    const client = new AWS.CognitoIdentityServiceProvider({
                        accessKeyId: 'AKIAT77CFA37WH6OB2CP',
                        secretAccessKey: '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',
                        region: 'us-east-1',
                      });
                    setClient(client);
                    const userIdFromStorage = sessionStorage.getItem("USER_ID");
                    setUserId(userIdFromStorage);
                    const userResponse= await fetch(`https://team27-express.cpsc4911.com/users?USER_ID=${userIdFromStorage}`);
                    const userData = await userResponse.json();
                    setCurrentUser(userData[0]);
                    const username = userData[0].USERNAME;
                    const params = {
                        UserPoolId: userpool.getUserPoolId(),
                        Username: username, 
                    }
                    client.adminGetUser(params, function(err, data){
                        if(err){
                            console.log('Error fetching attributes from coginito :', err);
                        }
                        else{
                            console.log(data.UserAttributes);
                            setUserAttributes(data.UserAttributes);
                            const email = data.UserAttributes.find(attribute => attribute.Name === 'email');          
                            const lname = data.UserAttributes.find(attribute => attribute.Name === 'family_name');          
                            const fname = data.UserAttributes.find(attribute => attribute.Name === 'given_name');          
                            const birthday = data.UserAttributes.find(attribute => attribute.Name === 'birthdate');
                            setEmail(email);
                            setLname(lname);
                            setBirthday(birthday);
                            setFname(fname);
                        }
                    });
                } catch (error) {
                    console.error('Error fetching user attributes:', error);
                }
            };
            fetchUserAttributes();
        }, []);
    
        // Update user attributes
        const updateUserAttributes = () => {
            const userAttributesArray = [];
            const username = userDate.USERNAME;
                userAttributes.forEach(attribute => {
                    const attributeName = attribute.Name;
                    const attributeValue = newUserAttribute[attributeName];
                    if (attributeValue !== undefined && attributeValue !== null) {
                        userAttributesArray.push({
                            "Name": attributeName,
                            "Value": attributeValue
                        });
                        if(attributeName  === fname.Name){
                            const jsonData = {
                                FNAME: attributeValue
                            }
                            fetch(`https://team27-express.cpsc4911.com/users/${USER_ID}`, {
                                method: 'PATCH',
                                headers: {
                                'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(jsonData),
                            })
                                .then(response => {
                                if (!response.ok) {
                                    throw new Error('Failed to update first name');
                                }
                                return response.json();
                                })
                                .then(data => {
                                console.log('User sucessfully updated:', data);
                                })
                                .catch(error => {
                                console.error('Error adding user:', error);
                                });
                            }
                            if(attributeName  === lname.Name){
                                const jsonData = {
                                    LNAME: attributeValue
                                }
                                fetch(`https://team27-express.cpsc4911.com/users/${USER_ID}`, {
                                    method: 'PATCH',
                                    headers: {
                                    'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(jsonData),
                                })
                                    .then(response => {
                                    if (!response.ok) {
                                        throw new Error('Failed to update last name');
                                    }
                                    return response.json();
                                    })
                                    .then(data => {
                                    console.log('User sucessfully updated:', data);
                                    })
                                    .catch(error => {
                                    console.error('Error adding user:', error);
                                    });
                            }
                          }
                        });
                    
                if(userAttributesArray.length !== 0 ||userAttributesArray.length !== undefined)
                {
                    const attributeUpdate = {
                        UserPoolId: userpool.getUserPoolId(),
                        Username: username, 
                        UserAttributes: userAttributesArray
                    }
                client.adminUpdateUserAttributes(attributeUpdate, function(err, data){
                    if(err){
                        console.log('Error updating data to cognito :', err);
                    }
                    else{
                        setUpdateUser(false);
                        setNewUserAttribute([]);
                        // Refresh user attributes after updating
                        const params = {
                            UserPoolId: userpool.getUserPoolId(),
                            Username: username, 
                        }
                        client.adminGetUser(params, function(err, data){
                            if(err){
                                console.log('Error fetching attributes from coginito :', err);
                            }
                            else{
                                setUserAttributes(data.UserAttributes);
                                const email = data.UserAttributes.find(attribute => attribute.Name === 'email');          
                                const lname = data.UserAttributes.find(attribute => attribute.Name === 'family_name');          
                                const fname = data.UserAttributes.find(attribute => attribute.Name === 'given_name');          
                                const birthday = data.UserAttributes.find(attribute => attribute.Name === 'birthdate');
                                setEmail(email);
                                setLname(lname);
                                setBirthday(birthday);
                                setFname(fname);
                            }
                        });
                    }
                })
                }
        };

    const handleUpdateAttributes = (field, value) => {
            const updatedUserAttribute = { ...newUserAttribute };
            if(field === "fname"){
                updatedUserAttribute[fname.Name] = value;            
            }
            if(field === "lname"){
                updatedUserAttribute[lname.Name] = value;            
            }
            if(field === "birthday"){
                updatedUserAttribute[birthday.Name] = value;            
            }
            setNewUserAttribute(updatedUserAttribute);
        };
    const handlePasswordUpdateClick = () => {
        if(newPassword.length < 6){
            setPasswordErr("Password too short");
            return;
        }
        else if(newPassword === ''){
            setPasswordErr("Must give password");
            return;
        }
        else{
            const username = userDate.USERNAME;
            const params = {
                Password: newPassword,
                Permanent: true,
                Username: username,
                UserPoolId: userpool.getUserPoolId(),
            }
            client.adminSetUserPassword(params,function(err, data){
                if(err){
                    console.log(err);
                    setPasswordErr(err);
                }
                else{
                    setShowPassword(false);
                fetch('https://team27-express.cpsc4911.com/password_change', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    USER_ID: USER_ID,
                    AUDIT_USER_ID: USER_ID,
                    REASON: "Profile Password Reset"
                }),
            });
                }
            })
        }
    };
        
        useEffect(() => {
            // Check if userAttributes exist and set loading accordingly
            setIsLoading(!userAttributes);
        }, [userAttributes]);
    
        if (isLoading) {
            return <CircularProgress />; // Show loading indicator if no user attributes
        }
    
        return (
            <Box sx={{ maxWidth: 600, margin: 'auto', textAlign: 'center', padding: 3 }}>            <Typography variant="h4" gutterBottom>Account Information</Typography>
            <Box sx={{ marginBottom: 3 }}>
                <Typography variant="h5" gutterBottom>Account Details:</Typography>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li><Typography variant="h6">Email: {email.Value}</Typography></li>
                    <li><Typography variant="h6">First Name: {fname.Value}</Typography></li>
                    <li><Typography variant="h6">Last Name: {lname.Value}</Typography></li>
                    <li><Typography variant="h6">Birthdate: {birthday.Value}</Typography></li>
                </ul>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center'}}>
            {(!showPassword && !updateUser) && <Button variant="contained" onClick={() => setUpdateUser(true)}>Update Attributes</Button>}
            {(!updateUser && !showPassword)&& <Button variant="contained" onClick={() => setShowPassword(true)}>New Password</Button>}
            </Box>
            {updateUser && (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center'}}>
                        <TextField
                            value={newUserAttribute[fname.Name] || ''}
                            onChange={(e) => handleUpdateAttributes("fname", e.target.value )}
                            label={`New First Name`}
                            helperText={fNameErr}
                        />
                        <TextField
                            value={newUserAttribute[lname.Name] || ''}
                            onChange={(e) => handleUpdateAttributes("lname", e.target.value )}
                            label={`New Last Name`}
                            helperText={lNameErr}
                        />
                        <TextField
                            value={newUserAttribute[birthday.Name] || ''}
                            onChange={(e) => handleUpdateAttributes("birthday", e.target.value )}
                            label={`New Birthday`}
                            helperText={birthDayErr}
                        />

                        <Button type="button" variant="contained" onClick={() => updateUserAttributes()}>Submit</Button>
                </Box>
            )}
            {showPassword && (
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center', marginTop : '25px'}}>
                <TextField
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type="password"
                    label="New Password"
                    helperText={passwordErr}
                />
                <Button type="button" variant="contained" onClick={handlePasswordUpdateClick}>Set New Password</Button>
                </Box>
            )}
        </Box>
        );
};

export default Profile;