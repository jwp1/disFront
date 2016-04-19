'use strict';

angular.module('myApp.view3', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view3', {
    templateUrl: 'view3/view3.html',
    controller: 'View3Ctrl'
  });
}])

.controller('View3Ctrl', ['$scope', '$http', '$timeout', 'gameID', '$location', function($scope, $http, $timeout, gameID, $location) {
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
	$scope.wait = 0;
	$scope.fights = [];
	$scope.winners = [];
	$scope.currentFight = [];
	$scope.currentWinner = {};
	$scope.currentRound = 1;
	$scope.rounds = 0;
	$scope.uberIdea = ""
	$scope.current_players = 0;
	$scope.currentTime = 0;
	$scope.decrement = 1;
	$scope.gameID = gameID.get();
	// Temp variables
	$scope.ideas = [];
	$scope.ideas[0] = {name: "Google", description: "A search engine"};
	$scope.ideas[1] = {name: "Yahoo", description: "Another search engine"};
	$scope.uberIdeas = [];
	$scope.uberIdeas[0] = {id:0, description: "The functionality of google but with the aesthetic of yahoo",strength:2};

	if(!$scope.gameID)
	{
		console.log($scope.gameID)
		$scope.question = "Error joining"
		$scope.mode = 99
		$location.path('/view2');
	}

	var dispatcher = new WebSocketRails('jackie.elrok.com/websocket');

	dispatcher.bind('player_joined', function(data) {
	  $scope.current_players++;
	  $scope.$apply();
	});

	dispatcher.bind('ideas_submitted', function(data) {
	 $scope.currentTime = 1;
	  $scope.$apply();
	});

	$scope.$on('$routeChangeStart', function() {
	    dispatcher.disconnect();
	});

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
		"http://jackie.elrok.com" + '/games/show', {main: true, game:$scope.gameID}
			)
		.then(function (res) {
			if(res.data.error)
			{
				$scope.mode = 8
				$scope.question = "Game already in progress"
			}
			else
			{
				$scope.game = res.data.game
				$scope.rounds = res.data.game.rounds
				$scope.questions = res.data.questions;
			}
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
				$scope.ideaTitleSwap();
				})
	}


	$scope.goUberRound = function() {
		console.log($scope.winners)
		$scope.question = "Combine the winners"
		$scope.mode = 5;
		$scope.currentTime = $scope.game.input_timer;
		$scope.decrement = 1;
		$('#uber_timer').html($scope.currentTime + ' second(s)');
		var interval = setInterval(function(){
		  $scope.currentTime = $scope.currentTime-$scope.decrement;
		  $('#uber_timer').html($scope.currentTime + ' second(s)');
		  if ($scope.currentTime < 0)
			{
				clearInterval(interval);
				$('#uber_timer').html($scope.game.input_timer + ' second(s)');
			     $http.post(
				"http://jackie.elrok.com" + '/uber_ideas/index', {game: $scope.game.id, main:true, round:$scope.currentRound}
					)
				.then(function (res) {
					if(res.data.error)
		  			{
		  				$scope.mode = 8
				      		$http.post(
				      		"http://jackie.elrok.com" + '/uber_ideas/display_uber_winner', {game: $scope.game.id}
				      			)
				      		.then(function (res) {
				      			if(res.data.error)
				      			{
									$scope.currentWinner = undefined
									$scope.players = res.data.players
									$scope.mode = 7;
									$scope.question = "No-one submitted an idea! But it's Game over anyway!"
				      			}});
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
		$scope.decrement = 1;
		$('#uber_battle_timer').html($scope.currentTime + ' second(s)');
		var interval = setInterval(function(){
		  $scope.currentTime = $scope.currentTime-$scope.decrement;
		  $('#uber_battle_timer').html($scope.currentTime + ' second(s)');
		  if ($scope.currentTime < 0)
			{
				clearInterval(interval);
				$('#uber_battle_timer').html($scope.game.battle_timer + ' second(s)');
	      		$http.post(
	      		"http://jackie.elrok.com" + '/uber_ideas/display_uber_winner', {game: $scope.game.id}
	      			)
	      		.then(function (res) {
	      			if(res.data.error)
	      			{
	      				$scope.currentWinner = res.data.winner;
						$scope.currentPlayerWinner = res.data.player;
						$scope.players = res.data.players
						$scope.mode = 7;
						$scope.question = "No-one voted! But it's Game over anyway!"
	      			}
	      			else
	      			{
		      			$scope.currentWinner = res.data.winner;
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
		$scope.decrement = 1;
		$('#battle_timer').html($scope.currentTime + ' second(s)');
		var interval = setInterval(function(){
		  $scope.currentTime = $scope.currentTime-$scope.decrement;
		  $('#battle_timer').html($scope.currentTime + ' second(s)');
		  if ($scope.currentTime < 0)
			{
				clearInterval(interval);
				$('#battle_timer').html($scope.game.battle_timer + ' second(s)');
	      		$http.post(
	      		"http://jackie.elrok.com" + '/ideas/display_winner', {game: $scope.game.id, round:$scope.currentRound}
	      			)
	      		.then(function (res) {
	      			if(res.data.error)
	      			{
	      				$scope.currentRound++
			      		$scope.ideaTitleSwap();
			      		if($scope.currentRound*1 <= $scope.rounds*1)
			      		{
			      			$scope.mode = 2;
			      			$scope.enterIdeas();
			      		}
			      		else
			      			$scope.goUberRound()
	      			}
	      			else
	      			{
		      			$scope.currentWinner = res.data.winner;
		      			if (res.data.votes !=undefined)
							$scope.currentWinner.votes = res.data.votes;
						$scope.currentPlayerWinner = res.data.player
						$scope.mode = 4;
						$scope.question = "Winner!"
						$scope.winners.push(res.data.winner);
						$timeout(function() {
							$scope.currentRound++
							dispatcher.trigger('winner_display', {game_id:$scope.gameID, round:$scope.currentRound-1})
				      		$scope.ideaTitleSwap();
				      		if($scope.currentRound*1 <= $scope.rounds*1)
				      		{
				      			$scope.mode = 2;
				      			$scope.enterIdeas();
				      		}
				      		else
				      			$scope.goUberRound()
				      	}, 5000)
					}

	      			});

	    	}
		}, 1000);
	}

	$scope.getTime = function (){
		return $scope.currentTime;
	}

	$scope.setDec = function (param){
		$scope.currentTime = 1
	}

	$scope.enterIdeas = function (){
		$scope.currentTime = $scope.game.input_timer;
		$scope.decrement = 1;
		$('#timer').html($scope.currentTime + ' second(s)');
		var interval = setInterval(function(){
			console.log("Dec:"+$scope.decrement)
		  $scope.currentTime = $scope.currentTime-$scope.decrement;
		  $('#timer').html($scope.currentTime + ' second(s)');
		  if ($scope.currentTime < 0)
			{
				clearInterval(interval);
				$('#timer').html($scope.game.input_timer + ' second(s)');
			     $http.post(
				"http://jackie.elrok.com" + '/ideas/index', {game: $scope.game.id, round: $scope.currentRound, main:true}
					)
				.then(function (res) {
					if(res.data.error)
		  			{
		  				$scope.mode = 8
		  				$scope.question = "No-one submitted an idea"
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