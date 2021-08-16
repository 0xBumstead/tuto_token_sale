const FmhToken = artifacts.require("./FmhToken.sol");
const FmhTokenSale = artifacts.require("./FmhTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(FmhToken, 1000000).then(function() {
    var tokenPrice = 5000000000000000;
    return deployer.deploy(FmhTokenSale, FmhToken.address, tokenPrice);  
  });
};

