import Cognito from './cognito.service';
import { Amplify, API } from 'aws-amplify';

export default class WaterguruService {


  public cognitoSvc: Cognito;

  constructor() {
    this.cognitoSvc = new Cognito();

    Amplify.configure({
      API: {
        endpoints: [
          {
            name: 'WGLambda',
            endpoint: 'https://lambda.us-west-2.amazonaws.com/2015-03-31/functions/prod-getDashboardView/invocations',
            service: 'lambda',
            region: 'us-west-2',
          },
        ],
      },
    });
  }

  public async signInUser(username: string, password: string): Promise<any> {
    return this.cognitoSvc.signInUser(username, password);
  }

  public async getDashboardInfo(): Promise<any> {
    const apiName = 'WGLambda';
    const path = '/';
    const myInit = {
      body: {
        'userId':this.cognitoSvc.cognitoUser && this.cognitoSvc.cognitoUser.getUsername(),
      },
    };
    return await API.post(apiName, path, myInit);
  }

}