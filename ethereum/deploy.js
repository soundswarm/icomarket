const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const IcoFactoryJson = require('./build/IcoFactory.json');

// ADD THIS FILE IF YOU WANT TO STORE YOUR SEED IN IT
const {seed} = require('../config');

// otherwise, add your own wallet seed here
// const seed = '';

const provider = new HDWalletProvider(
  seed,
  'https://rinkeby.infura.io/orDImgKRzwNrVCDrAk5Q',
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(
    JSON.parse(IcoFactoryJson.interface),
  )
    .deploy({data: IcoFactoryJson.bytecode})
    .send({gas: '5000000', from: accounts[0]});

  console.log('Factory Contract deployed to', result.options.address);
};
deploy();
