/* eslint-disable no-console */
import WaterguruService from '../services/wg.service';

const username = process.env.WG_USERNAME || process.argv[2];
const password = process.env.WG_PASSWORD || process.argv[3];

if (!username || !password) {
  console.error('Usage: WG_USERNAME=<email> WG_PASSWORD=<pass> npm run testWg');
  console.error('   or: npm run testWg -- <email> <password>');
  process.exit(1);
}

const wgService = new WaterguruService(console);
const userInfoPromise = wgService.signInUser(username, password);
userInfoPromise.then((userInfo) => {
  console.log(userInfo);
}).then(() => {
  wgService.getDashboardInfo().then( (dashboardInfo) => {
    console.log(dashboardInfo);
  });
});
