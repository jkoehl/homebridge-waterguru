// import AWS from 'aws-sdk';
// import crypto from 'crypto';

// export default class Cognito {

//   private region = 'us-west-2';
//   private clientId = '7pk5du7fitqb419oabb3r92lni';
//   private identityPoolId = 'us-west-2:691e3287-5776-40f2-a502-759de65a8f1c';
//   private poolId = 'us-west-2_icsnuWQWw';

//   private config = {
//     region: 'us-west-2',
//     identityPoolId: this.identityPoolId,
//     poolId: this.poolId,
//     accessKeyId: 'ff',
//     secretAccessKey: 'fff',
//   };

//   private cognitoIdentity;

//   constructor(){

//     AWS.config.update({region : 'us-west-2'});

//     AWS.config.credentials = new AWS.CognitoIdentityCredentials({
//       IdentityPoolId: this.identityPoolId,
//     }, {
//       region: this.region,
//     },
//     );

//     this.cognitoIdentity = new AWS.CognitoIdentityServiceProvider();
//   }

//   public async signInUser(username: string, password: string): Promise<boolean> {
//     const params = {
//       AuthFlow: 'USER_SRP_AUTH', /* required */
//       ClientId: this.clientId, /* required */
//       UserPoolId: this.poolId,
//       AuthParameters: {
//         'USERNAME': username,
//         'PASSWORD': password,
//       },
//     };

//     try {
//       const data = await this.cognitoIdentity.adminInitiateAuth(params).promise();
//       console.log(data);
//       return true;
//     } catch (error) {
//       console.log(error);
//       return false;
//     }
//   }
// }