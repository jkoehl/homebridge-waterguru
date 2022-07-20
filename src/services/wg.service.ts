import Cognito from './cognito.service';
import { Amplify, API } from 'aws-amplify';
import { Logger } from 'homebridge';

export default class WaterguruService {


  public cognitoSvc: Cognito;
  private cachedDashboardInfo = null;
  private lastDashboardCallTime = 0;

  constructor(
    public readonly log: Logger,
  ) {
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
    const curTimeMS = Date.now();
    if (curTimeMS - 60000 > this.lastDashboardCallTime) {
      this.lastDashboardCallTime = curTimeMS;
      this.log.debug('Refreshing dashboard info from cloud');
      this.cachedDashboardInfo = await API.post(apiName, path, myInit), 0;
    } else {
      this.log.debug('Returning cached dashboard info last check:', new Date(this.lastDashboardCallTime));
    }
    return this.cachedDashboardInfo;
  }

  public async getWaterbodyInfo(waterBodyId: string): Promise<any> {
    const dashboardInfo = await this.getDashboardInfo();
    return dashboardInfo.waterBodies.find((curWaterBody) => (curWaterBody.waterBodyId === waterBodyId));
  }

}