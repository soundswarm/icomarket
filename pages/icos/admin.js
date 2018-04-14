import React, {Component} from 'react';
import {Button, Message, Table} from 'semantic-ui-react';
import web3 from '../../ethereum/web3';
import Ico from '../../ethereum/Ico';
import Investment from '../../components/Investment';

import {Router} from '../../routes';
import Layout from '../../components/Layout';

class IcoAdmin extends Component {
  state = {
    loading: false,
    errorMessage: '',
  };
  newInvestments = {};
  newStatuses = [];

  static async getInitialProps(props) {
    const ico = Ico(props.query.address);
    try {
      var investmentsData = await ico.methods.getInvestments().call();
    } catch (e) {}

    const b32ToString = b32Array =>
      b32Array.map(b32 => web3.utils.toAscii(b32));
    let investments = {
      id: investmentsData[0],
      amount: investmentsData[1],
      currency: b32ToString(investmentsData[2]),
      exchangeRate: investmentsData[3],
      name: b32ToString(investmentsData[4]),
      investmentStatus: b32ToString(investmentsData[5]),
    };

    // make an array of investment objects
    const formattedInvestments = [];

    for (const el of investments.id) {
      formattedInvestments.push({});
    }
    for (let key in investments) {
      let values = investments[key];
      for (let i = 0; i < values.length; i++) {
        const val = values[i];
        formattedInvestments[i][key] = val;
      }
    }
    this.newStatuses = formattedInvestments.map(
      investment => investment.investmentStatus,
    );
    const summary = await ico.methods.getSummary().call();

    const data = {
      maxInvestors: parseInt(summary[1]),
      maxInvestments: parseInt(summary[2]),
      balance: parseInt(summary[3]),
      investorCount: parseInt(summary[4]),
      icoStatus: summary[5],
      totalApproved: 0,
      approvedCount: 0,
    };

    const icoSummary = formattedInvestments.reduce((mem, investment) => {
      const amount = parseInt(investment.amount);
      mem.total += amount;
      if (investment.investmentStatus === 'approved') {
        mem.totalApproved += amount;
      }
      if (investment.investmentStatus === 'approved') {
        mem.approvedCount++;
      }
      return mem;
    }, data);

    return {formattedInvestments, icoSummary, address: props.query.address};
  }

  changeStatus = newInvestment => {
    this.newInvestments[newInvestment.id] = newInvestment;
  };

  submitChanges = async () => {
    this.setState({loading: true, errorMessage: ''});
    for (const i in this.newInvestments) {
      this.newStatuses[i] = this.newInvestments[i].investmentStatus;
    }

    const ico = Ico(this.props.address);
    const codedNewStatuses = this.newStatuses.map(status => {
      if (status === 'rejected') {
        return 0;
      }
      if (status === 'approved') {
        return 1;
      } else {
        return 2;
      }
    });
    try {
      const accounts = await web3.eth.getAccounts();
      await ico.methods.editInvestments(codedNewStatuses).send({
        from: accounts[0],
      });
    } catch (err) {
      this.setState({errorMessage: err.message});
    }
    this.setState({loading: false});
    Router.pushRoute(`/icos/${this.props.address}/admin`);
  };

  render() {
    const lastHeader = 'Change Investment Status';
    const headers = this.props.formattedInvestments[0]
      ? [...Object.keys(this.props.formattedInvestments[0]), lastHeader]
      : [];

    return (
      <Layout>
        <h3>Admin</h3>
        <Table>
          <Table.Header>
            <Table.Row>
              {[
                '',
                `Balance: $${this.props.icoSummary.balance}`,
                ``,
                ``,
                ``,
                <div>
                  <div>{`Total Approved: $${
                    this.props.icoSummary.totalApproved
                  } `}</div>
                  <div>
                    {' '}
                    {`# of Investors Approved: ${
                      this.props.icoSummary.approvedCount
                    }`}
                  </div>
                </div>,
                ``,
              ].map((header, i) => (
                <Table.HeaderCell key={i}>
                  <div>{header}</div>
                </Table.HeaderCell>
              ))}
            </Table.Row>
            <Table.Row>
              {headers.map((header, i) => (
                <Table.HeaderCell key={i}>
                  {header === lastHeader ? (
                    <div>
                      <Button
                        onClick={this.submitChanges}
                        loading={this.state.loading}
                      >
                        Submit Changes
                      </Button>
                      {this.state.errorMessage ? (
                        <Message
                          error
                          header="Oops!"
                          content={this.state.errorMessage}
                        />
                      ) : null}

                      {this.state.loading ? (
                        <Message content="Sending contract changes to Ethereum blockchain.  This may take a minute. Do not navigate away." />
                      ) : null}
                    </div>
                  ) : null}
                  <div>{header}</div>
                </Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {this.props.formattedInvestments.map((investment, i) => {
              return (
                <Investment
                  {...investment}
                  headers={headers}
                  changeStatus={this.changeStatus}
                  icoSummary={this.props.icoSummary}
                  key={i}
                />
              );
            })}
          </Table.Body>
        </Table>
      </Layout>
    );
  }
}

export default IcoAdmin;
