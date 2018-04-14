import React, {Component} from 'react';
import {Message, Table, Select} from 'semantic-ui-react';
import Ico from '../ethereum/Ico';
import web3 from '../ethereum/web3';
import {Router} from '../routes';

class InvestForm extends Component {
  state = {
    newStatus: '',
  };

  render() {
    const handleChangeStatus = (e, {value}) => {
      this.setState({newStatus: value}, () => {
        const newInvestment = {
          ...this.props,
          ...{investmentStatus: this.state.newStatus},
        };
        this.props.changeStatus(newInvestment);
      });
    };
    const select = () => {
      const normalOrLate =
        this.props.investmentStatus.slice(0, 'normal'.length) === 'normal' ||
        this.props.investmentStatus.slice(0, 'late'.length) === 'late';

      const underMaxInvested =
        this.props.icoSummary.totalApproved + parseInt(this.props.amount) <=
        this.props.icoSummary.maxInvestments;

      const underMaxInvestors =
        this.props.icoSummary.approvedCount + 1 <=
        this.props.icoSummary.maxInvestors;
      let options = ['', 'rejected'];
      if (underMaxInvested && underMaxInvestors) {
        options.push('approved');
      }
      options = options.map((option, i) => {
        return {text: option, value: option, key: i};
      });
      // web3 returns 32bytes string so we need to trim them
      return normalOrLate ? (
        <Select
          options={options}
          value={this.state.newStatus}
          onChange={handleChangeStatus}
        />
      ) : null;
    };
    const tableCell = header => {
      return header === 'Change Investment Status' ? (
        select(header)
      ) : (
        <Table.Cell>{this.props[header]}</Table.Cell>
      );
    };
    return (
      <Table.Row>
        {this.props.headers.map(header => {
          return tableCell(header);
        })}
      </Table.Row>
    );
  }
}

export default InvestForm;
