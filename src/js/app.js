App = {
	web3Provider: null,
	contracts: {},
	account: '0x0',
	loading: false,
	tokenPrice: 5000000000000000,
	tokensSold: 0,
	tokensAvailable: 750000,

	init: function() {
		console.log("App initialized…");
		return App.initWeb3();
	},

	initWeb3: function() {
		if (typeof web3 !== 'undefined') {
			// If a web3 instance is already provided by Meta Mask.
//			web3 = new Web3(web3.currentProvider);
			web3 = new Web3(window.ethereum);
			App.web3Provider = web3.currentProvider;			
		} else {
			// Specify default instance if no web3 instance provided
			App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
			web3 = new Web3(App.web3Provider);
		}
		return App.initContracts();
	},

	initContracts: function() {
		$.getJSON("FmhTokenSale.json", function(FmhTokenSale) {
			App.contracts.FmhTokenSale = TruffleContract(FmhTokenSale);
			App.contracts.FmhTokenSale.setProvider(App.web3Provider);
			App.contracts.FmhTokenSale.deployed().then(function(FmhTokenSale) {
				console.log("FMH Token Sale Address:", FmhTokenSale.address);
			});
		}).done(function() {
			$.getJSON("FmhToken.json", function(FmhToken) {
				App.contracts.FmhToken = TruffleContract(FmhToken);
				App.contracts.FmhToken.setProvider(App.web3Provider);
				App.contracts.FmhToken.deployed().then(function(FmhToken) {
					console.log("FMH Token Address:", FmhToken.address);	
				});
				App.listenForEvents();
				return App.render();
			});
		});	
	},

	listenForEvents: function() {
		App.contracts.FmhTokenSale.deployed().then(function(instance) {
			instance.Sell({}, {
				fromBlock: 0,
				toBlock: 'latest',
			}).watch(function(error, event) {
				console.log("event triggered", event);
				App.render();
			});
		});
	},

	render: function() {
		if (App.loading) {
			return;
		}
		App.loading = true;

		var loader = $('#loader');
		var content = $('#content');

		loader.show();
		content.hide();

		//


		App.contracts.FmhTokenSale.deployed().then(function(instance) {
			FmhTokenSaleInstance = instance;

			web3.eth.getCoinbase(function(err, account) {
				if(err == null) {
					App.account = account;
					$('#accountAddress').html("Your account: " + account);
					console.log("Connected account:", App.account);
				}
			});

			return FmhTokenSaleInstance.tokenPrice();
		}).then(function(tokenPrice) {

			console.log("Connected account:", App.account);

			App.tokenPrice = tokenPrice;
			$('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
			return FmhTokenSaleInstance.tokensSold();
		}).then(function(tokensSold) {
			App.tokensSold = tokensSold.toNumber();
			$('.tokens-sold').html(App.tokensSold);	
			$('.tokens-available').html(App.tokensAvailable);

			var progressPercent = (App.tokensSold / App.tokensAvailable) * 100;
			$('#progress').css('width', progressPercent + '%');

			App.contracts.FmhToken.deployed().then(function(instance) {
				FmhTokenInstance = instance;
				return FmhTokenInstance.balanceOf(App.account);
			}).then(function(balance) {
				$('.fmh-balance').html(balance.toNumber());

				App.loading = false;
				loader.hide();
				content.show();
			});
		});
	},

	buyTokens: function() {
		$('#content').hide();
		$('#loader').show();
		var numberOfTokens = $('#numberOfTokens').val();

		App.contracts.FmhTokenSale.deployed().then(function(instance) {
			return instance.buyTokens(numberOfTokens, {
				from: App.account,
				value: numberOfTokens * App.tokenPrice.toNumber()
			});
		}).then(function(result) {
			console.log("Tokens bought…");
			$('form').trigger('reset');			
		});
	}

}

$(function() {
	$(window).load(function() {
		App.init();
	})
});