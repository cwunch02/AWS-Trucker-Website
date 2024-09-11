import userpool from "../userpool";
import {CognitoUser} from "amazon-cognito-identity-js";
import {AuthenticationDetails} from "amazon-cognito-identity-js";
export const authenticate = (Email, Password)=>{
    return new Promise((resolve,reject)=>{
        const user = new CognitoUser({
            Username:Email,
            Pool:userpool
        });

        const authDetails = new AuthenticationDetails({
            Username:Email,
            Password
        });

        user.authenticateUser(authDetails, {
            onSuccess:(result) => {
                console.log("login successful");
                resolve(result);
            },
            onFailure:(err)=>{
                console.log("login failed", err);
                reject(err);
            }
        });
    });
};

export const logout = () => {
    const user = userpool.getCurrentUser();
    user.signOut();
    window.location.href = '/';
}