import WaterguruService from '../services/wg.service';

const userInfoPromise = new WaterguruService().signInUser('jkoehl@gmail.com', 'GFKW4CoMM-wadq6W');
userInfoPromise.then((userInfo) => {
  console.log(userInfo);
});
