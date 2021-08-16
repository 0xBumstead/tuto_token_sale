pragma solidity ^0.5.0;

import "./FmhToken.sol";

contract FmhTokenSale {
  address payable admin;
  FmhToken public tokenContract;
  uint public tokenPrice;
  uint public tokensSold;

  event Sell(
    address _buyer,
    uint _amount
  );

  constructor(FmhToken _tokenContract, uint _tokenPrice) public {
  	admin = msg.sender;
  	tokenContract = _tokenContract;
  	tokenPrice = _tokenPrice;    
  }

  function multiply(uint x, uint y) internal pure returns (uint z) {
     require(y == 0 || (z = x * y) / y == x);
  }

  function buyTokens(uint _numberOfTokens) public payable {
    require(msg.value == multiply(_numberOfTokens, tokenPrice));
    require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
    require(tokenContract.transfer(msg.sender, _numberOfTokens));
    tokensSold += _numberOfTokens;

    emit Sell(msg.sender, _numberOfTokens);
  }
  
  function endSale() public {
    require(msg.sender == admin);
    require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
    
    admin.transfer(address(this).balance);
  }
  
}
