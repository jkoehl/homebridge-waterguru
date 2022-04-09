import { Amplify, Auth } from 'aws-amplify';
import { CognitoUser } from '@aws-amplify/auth';

export default class Cognito {

  private region = 'us-west-2';
  private clientId = '7pk5du7fitqb419oabb3r92lni';
  private identityPoolId = 'us-west-2:691e3287-5776-40f2-a502-759de65a8f1c';
  private poolId = 'us-west-2_icsnuWQWw';

  public cognitoUser: CognitoUser | null = null;

  constructor() {
    Amplify.configure({
      aws_project_region: this.region,
      aws_cognito_region: this.region,
      aws_user_pools_id: this.poolId,
      aws_user_pools_web_client_id: this.clientId,
      aws_cognito_identity_pool_id: this.identityPoolId,
    });
  }

  public async signInUser(username: string, password: string): Promise<CognitoUser | any> {
    this.cognitoUser = await Auth.signIn(username, password);
    return this.cognitoUser;
  }
}