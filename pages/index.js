import web3 from '../ethereum/web3';
import IcoFactory from '../ethereum/IcoFactory';
import React, {Component} from 'react';
import {Card, Button} from 'semantic-ui-react';
import {Link} from '../routes';
import Layout from '../components/Layout';

class Index extends Component {
  static async getInitialProps() {
    const accounts = await web3.eth.getAccounts();
    const icos = await IcoFactory.methods.getDeployedIcos().call();

    return {icos};
  }
  renderIco() {
    const items = this.props.icos.map(address => {
      return {
        header: address,
        description: (
          <Link route={`/icos/${address}`}>
            <a>View Ico</a>
          </Link>
        ),
        fluid: true,
      };
    });

    return <Card.Group items={items} />;
  }

  render() {
    return (
      <Layout>
        <Link route="/icos/new">
          <a>
            <Button
              floated="right"
              content="Create Ico"
              icon="add circle"
              primary
            />
          </a>
        </Link>

        <h3>ICOs</h3>

        {this.renderIco()}
      </Layout>
    );
  }
}
export default Index;
