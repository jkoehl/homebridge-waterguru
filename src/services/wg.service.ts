import Cognito from './cognito.service2';

export default class WaterguruService {


  public cognitoSvc: Cognito;

  constructor() {
    this.cognitoSvc = new Cognito();
  }

  public async signInUser(username: string, password: string): Promise<any> {
    return this.cognitoSvc.signInUser(username, password);
  }
}