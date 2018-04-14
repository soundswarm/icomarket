import React, {Component} from 'react';
import {Form, Button, Input, Message} from 'semantic-ui-react';
import IcoFactory from '../../ethereum/IcoFactory';
import web3 from '../../ethereum/web3';
import {Router} from '../../routes';
import Layout from '../../components/Layout';

class NewIco extends Component {
  state = {
    maxInvestors: '',
    maxInvestment: '',
    errorMessage: '',
    loading: false,
  };

  onSubmit = async event => {
    event.preventDefault();

    this.setState({loading: true, errorMessage: ''});

    try {
      const accounts = await web3.eth.getAccounts();
      await IcoFactory.methods
        .createIco(
          parseInt(this.state.maxInvestors),
          parseInt(this.state.maxInvestment),
        )
        .send({
          from: accounts[0],
        });

      Router.pushRoute('/');
    } catch (err) {
      this.setState({errorMessage: err.message});
    }

    this.setState({loading: false});
  };

  render() {
    return (
      <Layout>
        <h3>
          You must be logged into Metamask on the Rinkeby Network to create a new Initial Coin Offering
          (ICO)
        </h3>

        <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
          <Form.Field>
            <label>Maximum value of all investments</label>
            <Input
              label="$ USD"
              labelPosition="right"
              value={this.state.maxInvestment}
              onChange={event =>
                this.setState({maxInvestment: event.target.value})
              }
            />
          </Form.Field>

          <Form.Field>
            <label>Maximum number of investors</label>
            <Input
              label=""
              labelPosition="right"
              value={this.state.maxInvestors}
              onChange={event =>
                this.setState({maxInvestors: event.target.value})
              }
            />
          </Form.Field>

          <Message error header="Oops!" content={this.state.errorMessage} />
          {this.state.loading ? (
            <Message content="Sending contract to Ethereum blockchain.  This may take a minute. Do not navigate away." />
          ) : null}
          <Button loading={this.state.loading} primary>
            Create ICO
          </Button>
        </Form>
      </Layout>
    );
  }
}

export default NewIco;
