# icomarket
An ICO market.  Ethereum web app built with next.js, React, Solidty, and web3.

Run the app in your dev. environment on the master branch: 
`npm i`
`npm start`

to deploy a new ICO Factory (i.e. a solodity contract that deploys ICO contracts) on ethereum:
add a seed phrase to /config.js
`npm run deployContract`
copy the address of the deployed contract to IcoFactory
`npm start`
