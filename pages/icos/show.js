import React, {Component} from 'react';
import {Card, Grid, Button} from 'semantic-ui-react';
import {Link} from '../../routes';
import Ico from '../../ethereum/Ico';
import web3 from '../../ethereum/web3';
import InvestForm from '../../components/InvestContainer';
import Layout from '../../components/Layout';
console.log('hell');
class Show extends Component {
  static async getInitialProps(props) {
    const ico = Ico(props.query.address);
    const summary = await ico.methods.getSummary().call();
    return {
      address: props.query.address,
      icoManager: summary[0],
      maxInvestors: summary[1],
      maxInvestments: summary[2],
      balance: summary[3],
      investorCount: summary[4],
      icoStatus: summary[5],
    };
  }

  render() {
    const {
      icoManager,
      maxInvestors,
      maxInvestments,
      balance,
      investorCount,
      investmentCount,
      icoStatus,
    } = this.props;
    const items = [
      {
        header: icoStatus,
        meta: 'ICO status',
        key: 5,
      },

      {
        header: maxInvestors,
        meta: 'Max number of people that can invest in this ICO.',
        key: 1,
      },
      {
        header: investorCount,
        meta: 'Number of investors',
        key: 4,
      },
      {
        header: `$${maxInvestments}`,
        meta: 'Max total (usd) that can be Investmented in this ICO',
        key: 2,
      },
      {
        header: `$${balance}`,
        meta: 'Balance in usd',
        key: 3,
      },

      {
        header: icoManager,
        meta: 'Address of ICO Manager',
        style: {overflowWrap: 'break-word'},
        key: 0,
      },
    ];
    return (
      <Layout>
        <h3>ICO Details</h3>
        <Grid>
          <Grid.Row>
            <Grid.Column width={5}>
              <Card.Group items={items} />
            </Grid.Column>
            <Grid.Column width={5}>
              <Link route={`/icos/${this.props.address}/admin`}>
                <Button>Admin</Button>
              </Link>
            </Grid.Column>
            <Grid.Column width={6}>
              <InvestForm address={this.props.address} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default Show;
