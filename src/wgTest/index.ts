import WaterguruService from '../services/wg.service';

const wgService = new WaterguruService();
const userInfoPromise = wgService.signInUser('jkoehl@gmail.com', 'GFKW4CoMM-wadq6W');
userInfoPromise.then((userInfo) => {
  console.log(userInfo);
}).then(() => {
  wgService.getDashboardInfo().then( (dashboardInfo) => {
    console.log(dashboardInfo);
  });
});
