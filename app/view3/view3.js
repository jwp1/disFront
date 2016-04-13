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
	$scope.currentTime = 0;


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

	$scope.startGame = function () {
		$http.post(
			"http://jackie.elrok.com" + '/games/start', {game:$scope.game.id}
				)
			.then(function (res) {
				$scope.mode = 2
				$scope.enterIdeas();
				})
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
			console.log(res.data)
			});
	}


	$scope.goUberRound = function() {
		console.log($scope.winners)
		$scope.question = "Combine the winners"
		$scope.mode = 5;
		$scope.currentTime = $scope.game.input_timer;
		$('#uber_timer').html($scope.currentTime + ' second(s)');
		var interval = setInterval(function(){
		  $scope.currentTime--;
		  $('#uber_timer').html($scope.currentTime + ' second(s)');
		  if ($scope.currentTime == 0)
			{
				clearInterval(interval);
				$('#uber_timer').html('');
			     $http.post(
				"http://jackie.elrok.com" + '/uber_ideas/index', {game: $scope.game.id, main:true, round:$scope.currentRound}
					)
				.then(function (res) {
					if(res.data.error)
		  			{
		  				$scope.mode = 2
		  				$scope.question = "YOU ALL SUCK AND DIDN'T SUBMIT IDEAS"
		  				$scope.finishUberRound();
		  			}
		  			else
		  			{
		  				$scope.uberIdeas = res.data.uber_ideas
						$scope.mode = 6;
						$scope.question = "Choose a victor"
						$scope.finishUberRound();
		  			}
					
					});
			}
		}, 1000);
	}

	$scope.finishUberRound = function (){
		$scope.currentTime = $scope.game.battle_timer;
		$('#uber_battle_timer').html($scope.currentTime + ' second(s)');
		var interval = setInterval(function(){
		  $scope.currentTime--;
		  $('#uber_battle_timer').html($scope.currentTime + ' second(s)');
		  if ($scope.currentTime == 0)
			{
				clearInterval(interval);
				$('#uber_battle_timer').html('');
	      		$http.post(
	      		"http://jackie.elrok.com" + '/uber_ideas/display_uber_winner', {game: $scope.game.id}
	      			)
	      		.then(function (res) {
	      			if(res.data.error)
	      			{
	      				$scope.mode = 2
	      				$scope.question = "YOU ALL SUCK AND DIDN'T VOTE"
	      			}
	      			else
	      			{
		      			$scope.currentWinner = res.data.winner;
						$scope.currentWinner.votes = res.data.votes;
						$scope.currentPlayerWinner = res.data.player;
						$scope.players = res.data.players
						$scope.mode = 7;
						$scope.question = "Game over!"
	      			}
	      			
	      			});

	    	}
		}, 1000);
	}

	$scope.finishRound = function (){
		$scope.currentTime = $scope.game.battle_timer;
		$('#battle_timer').html($scope.currentTime + ' second(s)');
		var interval = setInterval(function(){
		  $scope.currentTime--;
		  $('#battle_timer').html($scope.currentTime + ' second(s)');
		  if ($scope.currentTime == 0)
			{
				clearInterval(interval);
				$('#battle_timer').html('');
	      		$http.post(
	      		"http://jackie.elrok.com" + '/ideas/display_winner', {game: $scope.game.id, round:$scope.currentRound}
	      			)
	      		.then(function (res) {
	      			if(res.data.error)
	      			{
	      				$scope.mode = 2
	      				$scope.question = "YOU ALL SUCK AND DIDN'T VOTE"
	      			}
	      			else
	      			{
		      			$scope.currentWinner = res.data.winner;
						$scope.currentWinner.votes = res.data.votes;
						$scope.currentPlayerWinner = res.data.player
						$scope.mode = 4;
						$scope.question = "Winner!"
						$scope.winners.push(res.data.winner);
	      			}
	      			
	      			});
	      		$timeout(function() {
	      			$http.post(
					"http://jackie.elrok.com" + '/ideas/decide_winner', {game: $scope.game.id, id: "hello",  round: $scope.currentRound}
						).then(function (res) {
							console.log("winner decided")
						})
		      		$scope.currentRound++
		      		$scope.ideaTitleSwap();
		      		if($scope.currentRound*1 <= $scope.rounds*1)
		      		{
		      			$scope.mode = 2;
		      			$scope.enterIdeas();
		      		}
		      		else
		      			$scope.goUberRound()
		      	}, 3000)

	    	}
		}, 1000);
	}

	$scope.getTime = function (){
		return $scope.currentTime;
	}

	$scope.enterIdeas = function (){
		$scope.currentTime = $scope.game.input_timer;
		$('#timer').html($scope.currentTime + ' second(s)');
		var interval = setInterval(function(){
		  $scope.currentTime--;
		  $('#timer').html($scope.currentTime + ' second(s)');
		  if ($scope.currentTime == 0)
			{
				clearInterval(interval);
				$('#timer').html('');
			     $http.post(
				"http://jackie.elrok.com" + '/ideas/index', {game: $scope.game.id, round: $scope.currentRound, main:true}
					)
				.then(function (res) {
					if(res.data.error)
		  			{
		  				$scope.mode = 2
		  				$scope.question = "YOU ALL SUCK AND DIDN'T SUBMIT IDEAS"
		  				$scope.finishRound();
		  			}
		  			else
		  			{
		  				$scope.ideas = res.data.ideas
						$scope.mode = 3;
						console.log($scope.ideas);
						$scope.question = "Choose a victor"
						$scope.fights[0] = $scope.ideas
						$scope.currentFight = 0;
						$scope.finishRound();
		  			}
					
					});
			}
		}, 1000);
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
				console.log("created")
				})
	
}


$scope.loadGame();
}]);