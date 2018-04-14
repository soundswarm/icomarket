import web3 from './web3';
const IcoFactoryJson = require('./build/IcoFactory.json');

const instance = new web3.eth.Contract(
  JSON.parse(IcoFactoryJson.interface),
  '0x5c907b48fE908469f9321970C1FF89CA9A02ddbD'
);
export default instance;
