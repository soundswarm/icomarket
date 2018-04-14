const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/IcoFactory.json');
const compiledIco = require('../ethereum/build/Ico.json');

let accounts;
let factory;
let icoAddress;
let ico;

let maxInvestments = '10'; //$
let maxInvestors = '2';

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({data: compiledFactory.bytecode})
    .send({from: accounts[0], gas: '3000000'});

  const newIco = await factory.methods
    .createIco(maxInvestors, maxInvestments)
    .send({
      from: accounts[0],
      gas: '3000000',
    });

  [icoAddress] = await factory.methods.getDeployedIcos().call();
  ico = await new web3.eth.Contract(
    JSON.parse(compiledIco.interface),
    icoAddress,
  );
});

describe('Icos', () => {
  it('deploys a Icofactory and an Ico', () => {
    assert.ok(factory.options.address);
    assert.ok(ico.options.address);
  });

  it('allows people to invest', async () => {
    await ico.methods.invest('2', 'name1').send({
      from: accounts[1],
      gas: '3000000',
    });
    const investors = await ico.methods.getInvestments().call();
    assert(investors);
  });

  it('gets an Ico summary', async () => {
    let summary = await ico.methods.getSummary().call();
    assert(summary[1] === '2', summary[2] === '10');
  });
});
