'use strict';

angular.module('myApp.view3', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view3', {
    templateUrl: 'view3/view3.html',
    controller: 'View3Ctrl'
  });
}])

.controller('View3Ctrl', ['$scope', '$http', '$timeout',function($scope, $http, $timeout) {
	$scope.questions = [];
	// Modes:
	// 0 - Wait
	// 1 - Enter idea
	// 2 - Vote for an idea
	// 3 - Display winner
	// 4 - Enter final idea
	// 5 - Vote final idea
	// 6 - Display final ideas
	$scope.mode = 1;
	$scope.idea = {};
	$scope.fights = [];
	$scope.winners = [];
	$scope.currentFight = [];
	$scope.currentWinner = {};
	$scope.currentRound = 1;
	$scope.rounds = 0;
	$scope.uberIdea = ""
	$scope.current_players = 0;


	// Temp variables
	$scope.ideas = [];
	$scope.ideas[0] = {name: "Google", description: "A search engine"};
	$scope.ideas[1] = {name: "Yahoo", description: "Another search engine"};
	$scope.uberIdeas = [];
	$scope.uberIdeas[0] = {id:0, description: "The functionality of google but with the aesthetic of yahoo",strength:2};

	$scope.ideaTitleSwap = function () {
		var res = $.grep($scope.questions, function(q){ return q.round == $scope.currentRound; })
		console.log("hhhhhhh")
		console.log(res)
		if (res.length == 1)
			$scope.question = res[0].name
		else
			$scope.question = "Enter an idea"
	};

	$scope.loadGame = function () {
	$http.post(
		"http://jackie.elrok.com" + '/games/show', {main: true}
			)
		.then(function (res) {
			$scope.game = res.data.game
			$scope.rounds = res.data.game.rounds
			$scope.questions = res.data.questions;
			$scope.ideaTitleSwap();
			$scope.intervalFunction();
			console.log(res.data)
			});
	}

	$scope.currentPlayers = function () {
	$http.post(
		"http://jackie.elrok.com" + '/games/current_players', {test: "yes"}
			)
		.then(function (res) {
			$scope.players = res.data.players
			$scope.current_players = $scope.players.length
			if ($scope.current_players < $scope.game.player_count)
		    {
		    	$scope.intervalFunction();
		    }
		    else
		    {
		    	$scope.mode = 2
		    }
			console.log(res.data)
			});
	}

	$scope.intervalFunction = function(){
    $timeout(function() {
      $scope.currentPlayers();
    }, 5000)
  };

	$scope.genArray = function(num) {
    	return new Array(num);   
	}

	$scope.createGame = function (room) {
		console.log($scope.room.questions)
		$http.post(
			"http://jackie.elrok.com" + '/games/create', {game:room}
				)
			.then(function (res) {
				alert("woo")
				})
	
}


$scope.loadGame();
}]);