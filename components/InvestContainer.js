import React, {Component} from 'react';
import {Form, Input, Message, Button, List} from 'semantic-ui-react';
import Ico from '../ethereum/Ico';
import web3 from '../ethereum/web3';
import {Router} from '../routes';

class InvestForm extends Component {
  initFormState = {
    amount: '',
    currency: null,
    name: '',
    investStep: 'start',
    transactionData: null,
    loading: false,
    errorMessage: '',
  };
  state = {
    // the exchange rate could be sourced through an oracle in production.
    // calculate random eth exchange rate between 300 and 500
    exchangeRate: Math.random() * 200 + 300,
    ...this.initFormState,
  };

  onSubmit = async event => {
    event.preventDefault();
    const ico = Ico(this.props.address);
    this.setState({loading: true, errorMessage: '', transactionData: null});
    try {
      const accounts = await web3.eth.getAccounts();

      if (this.state.currency === 'eth') {
        var transactionData = await ico.methods
          .invest(parseInt(this.state.amount), this.state.name)
          .send({
            from: accounts[0],
            value: web3.utils.toWei(this.state.amount, 'ether'),
          });
      }
      if (this.state.currency === 'usd') {
        var transactionData = await ico.methods
          .invest(parseInt(this.state.amount), this.state.name)
          .send({
            from: accounts[0],
          });
      }
      this.setState({
        loading: false,
        transactionData,
      });
    } catch (err) {
      this.setState({errorMessage: err.message});
    }
  };

  currencyList = currencies => (
    <List selection verticalAlign="middle">
      <h3>Select Currency</h3>
      {currencies.map((currency, i) => {
        return (
          <List.Item
            onClick={() =>
              this.setState({currency, investStep: 'investmentForm'})
            }
            key={i}
          >
            <List.Content>
              <List.Header>{currency}</List.Header>
            </List.Content>
          </List.Item>
        );
      })}
    </List>
  );

  render() {
    const startInvestment = (
      <Button
        onClick={() => this.setState({investStep: 'selectCurrency'})}
        primary
      >
        Make Investment
      </Button>
    );

    const investmentForm = (
      <Form error={!!this.state.errorMessage}>
        <Form.Field>
          <label>Name</label>
          <Input
            value={this.state.name}
            onChange={event => this.setState({name: event.target.value})}
            label=""
            labelPosition="right"
          />
        </Form.Field>

        <Form.Field>
          <label>Amount to Invest</label>
          <Input
            value={this.state.amount}
            onChange={event => this.setState({amount: event.target.value})}
            label={this.state.currency}
            labelPosition="right"
          />
          {this.state.amount > 0 && this.state.currency !== 'usd' ? (
            <div>{`Equivalent in USD: $${Math.round(
              this.state.exchangeRate * this.state.amount,
            )}`}</div>
          ) : null}
        </Form.Field>

        <Message error header="Oops!" content={this.state.errorMessage} />

        {this.state.loading ? (
          <Message content="Sending payment to Ethereum blockchain.  This may take a minute. Do not navigate away." />
        ) : null}

        {this.state.transactionData ? (
          <div>
            <Message
              style={{overflowWrap: 'break-word'}}
              content={`Success. Here is your transaction hash: ${
                this.state.transactionData.transactionHash
              }`}
            />
            <Button
              onClick={() => {
                this.setState(this.initFormState);
                Router.replaceRoute(`/icos/${this.props.address}`);
              }}
              primary
            >
              Continue
            </Button>
          </div>
        ) : (
          <div>
            <Button
              onClick={this.onSubmit}
              primary
              loading={this.state.loading}
            >
              Submit Investment
            </Button>
            {!this.state.loading || this.state.errorMessage ? (
              <Button
                onClick={() => this.setState(this.initFormState)}
                color="red"
              >
                Cancel
              </Button>
            ) : null}
          </div>
        )}
      </Form>
    );

    return (
      <div>
        {this.state.investStep === 'start' ? startInvestment : null}
        {this.state.investStep === 'selectCurrency'
          ? this.currencyList(['eth', 'usd'])
          : null}
        {this.state.investStep === 'investmentForm' ? investmentForm : null}
      </div>
    );
  }
}

export default InvestForm;
