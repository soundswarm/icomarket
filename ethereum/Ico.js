import web3 from './web3';
import Ico from './build/Ico.json';

export default address => {
  return new web3.eth.Contract(JSON.parse(Ico.interface), address);
};
