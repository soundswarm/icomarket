pragma solidity ^0.4.18;
pragma experimental ABIEncoderV2;

contract Ico {
	address public icoManager;
	uint public maxInvestors;
	uint public maxInvestments; // total $ invested
	uint public balance;
	uint public investorCount;
	string public icoStatus;

	struct Investment {
     	uint id; //index in investments
		uint amount; // $usd
		string currency;
		uint exchangeRate; // currency/usd
		string name; //investor name
		string investmentStatus;
	}

    Investment[] investments;

	function Ico(uint maxNumInvestors, uint maxTotalInvestments, address managerAddress) public {
    	icoManager = managerAddress;
    	maxInvestors = maxNumInvestors;
    	maxInvestments = maxTotalInvestments;
    	balance = 0;
    	investorCount = 0;
    	icoStatus = 'open';
	}
    function getSummary() public view returns (address, uint,uint,uint,uint, string ){
        return (
            icoManager,
            maxInvestors,
            maxInvestments,
            balance,
            investorCount,
            icoStatus
        );

    }
    function stringToBytes32(string memory source) returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }

	function getInvestments() public  returns (
	    uint[], uint[],bytes32[],uint[],bytes32[],bytes32[]) {
        // we could require that only the ICO manager be able to make changes
	    uint[] memory ids = new uint[](investorCount);
        uint[] memory amounts = new uint[](investorCount);
        bytes32[] memory currencies = new bytes32[](investorCount);
        uint[] memory exchangeRates = new uint[](investorCount);
        bytes32[] memory names = new bytes32[](investorCount);
        bytes32[] memory investmentStatuses = new bytes32[](investorCount);

	    for (uint i = 0; i < investorCount; i++) {
	        Investment storage investment = investments[i];
	        ids[i] = investment.id;
	        amounts[i] = investment.amount;
	        currencies[i] = stringToBytes32(investment.currency);
	        exchangeRates[i] = investment.exchangeRate;
	        names[i] = stringToBytes32(investment.name);
	        investmentStatuses[i] = stringToBytes32(investment.investmentStatus);

	    }
	    return (ids, amounts, currencies, exchangeRates, names, investmentStatuses);
	}
    function getExchangeRate() public view returns (uint) {
        // in production, contract could fetch exhchange rate from oracle.
        // Front end could get exhange rate from the same 3rd party api.

        // calculate random eth exchange rate between 300 and 500
        uint randomNumber = uint(keccak256(block.difficulty, now));
        uint rate = (randomNumber % 200) + 300;
        return rate;
    }

    function editInvestments(uint[] newStatuses) public {
        // if any of the newStatuses are invalid no status are changed.

        // leaving this out for the demo: require(msg.sender == icoManager);
        uint sumOfNewApproved = 0;
        uint countOfNewApproved = 0;
        uint newBalance = balance;
        uint newInvestorCount = investorCount;
        string[] memory validStatuses = new string[](investorCount);
        uint rejected = 0;
        uint approved = 1;
        for(uint i=0; i < investments.length; i++) {
            if(newStatuses[i] == approved) {
                 require(keccak256(investments[i].investmentStatus) == keccak256('normal')
                 ||  keccak256(investments[i].investmentStatus) == keccak256('late'));
                 sumOfNewApproved += investments[i].amount;
                 countOfNewApproved++;
                 validStatuses[i] = 'approved';
            }else if(newStatuses[i] == rejected){
               require(keccak256(investments[i].investmentStatus) == keccak256('normal')
               ||  keccak256(investments[i].investmentStatus) == keccak256('late'));
               newBalance -= investments[i].amount;
               validStatuses[i] ='rejected';
           } else if(keccak256(investments[i].investmentStatus) == keccak256('approved')){
                sumOfNewApproved += investments[i].amount;
                countOfNewApproved ++;
                validStatuses[i] ='approved';
            }
             else {
               validStatuses[i] = investments[i].investmentStatus;
           }

        }
        require(sumOfNewApproved <= maxInvestments);
        require(countOfNewApproved <= maxInvestors);


        for(uint j = 0; j < validStatuses.length; j++) {
            if(keccak256(investments[j].investmentStatus) != keccak256(validStatuses[j])) {
                investments[j].investmentStatus = validStatuses[j];
            }
        }
        balance = newBalance;
        investorCount = newInvestorCount;

    }

	function invest (
	    uint amount,
	    string name
	    ) public payable {

	     uint usdInvestment;
	     bool investmentsRequirement;
	     bool investorsRequirement;
	    if (msg.value > 0) {
	        // eth investment
	       uint exchangeRate = getExchangeRate();
	       usdInvestment = msg.value / (10**18) * exchangeRate ;
	       investmentsRequirement = (balance + usdInvestment ) <= maxInvestments;
	       investorsRequirement = (investorCount + 1) <= maxInvestors;
	       require(msg.value > 0);

	        Investment memory newInvestment = Investment({
                id: investorCount,
               amount: usdInvestment,
               currency: 'eth',
               exchangeRate: exchangeRate,
               name: name,
               investmentStatus: 'normal'
	        });
            if(!investmentsRequirement || !investorsRequirement ) {
                newInvestment.investmentStatus = 'late';
            }
	       investments.push(newInvestment);
	       investorCount ++;
	       balance += usdInvestment;
	       if (balance >= maxInvestments || investorCount >= maxInvestors) {
	           icoStatus = 'oversubscribed';
	       }
	    } else {
	       //in a production app I would incorporate a way to verify
	       // this is a valid USD payment.
	       usdInvestment = amount;
	       investmentsRequirement = (balance +usdInvestment ) <= maxInvestments;
	       investorsRequirement= (investorCount + 1) <= maxInvestors;
	       // usd investment
            Investment memory newUsdInvestment = Investment({
                id: investorCount,
               amount: usdInvestment,
               currency: 'usd',
               exchangeRate: 1,
               name: name,
               investmentStatus: 'normal'
	        });
	        if(!investmentsRequirement || !investorsRequirement ) {
                newUsdInvestment.investmentStatus = 'late';
            }
	       investments.push( newUsdInvestment);
	       investorCount ++;
	       balance += usdInvestment;
	       if (balance >= maxInvestments || investorCount >= maxInvestors) {
	           icoStatus = 'oversubscribed';
	       }
	    }

	}
}

contract IcoFactory {
    address[] public deployedIcos;

    function createIco(uint maxInvestors, uint maxInvestment) public {
        address newIco = new Ico(maxInvestors,maxInvestment, msg.sender);
        deployedIcos.push(newIco);
    }

    function getDeployedIcos() public view returns (address[]) {
        return deployedIcos;
    }
}
