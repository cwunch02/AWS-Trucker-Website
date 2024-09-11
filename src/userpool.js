import { CognitoUserPool } from "amazon-cognito-identity-js"
import awsconfig from "./aws-exports";
const poolData = {
    UserPoolId: awsconfig.Auth.userPoolId,
    ClientId: awsconfig.Auth.userPoolWebClientId
}

export default new CognitoUserPool(poolData);