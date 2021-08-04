const FmhToken = artifacts.require("./FmhToken.sol");

module.exports = function(deployer) {
  deployer.deploy(FmhToken);
};
