'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', '$http', 'playerID', 'gameID', '$location', '$timeout',function($scope, $http, playerID, gameID, $location, $timeout) {


$scope.questions = [];
// Modes:
// 0 - Wait
// 1 - Enter idea
// 2 - Vote for an idea
// 3 - Display winner
// 4 - Enter final idea
// 5 - Vote final idea
// 6 - Display final ideas
$scope.mode = 0;
$scope.idea = {};
$scope.fights = [];
$scope.winners = [];
$scope.currentFight = [];
$scope.currentWinner = {};
$scope.currentRound = 1;
$scope.decrement = 1;
$scope.rounds = 0;
$scope.uberIdea = ""
$scope.playerID = playerID.get();
$scope.gameID = gameID.get();
$scope.phase = 0;
	
var dispatcher = new WebSocketRails('jackie.elrok.com/websocket');
var channel = dispatcher.subscribe('sockets');
channel.bind('next', function(data) {
  $scope.nextPhase(data);
});

$scope.$on('$routeChangeStart', function() {
    dispatcher.disconnect();
});

// Temp variables
$scope.ideas = [];
$scope.uberIdeas = [];

if(!$scope.playerID || !$scope.gameID)
	{
		console.log($scope.playerID)
		$scope.question = "Error joining"
		$scope.mode = 99
		$location.path('/view2');
	}

$scope.nextPhase = function (data) {
	console.log("Next")
	console.log($scope.game)
	console.log("----")
	console.log(data)
	if($scope.game == undefined || data == $scope.game.id)
	{
		switch($scope.phase) {
	    case 0:
	        $scope.loadGame();
	        $scope.phase = 1;
	        break;
	    case 1:
	        $scope.requestIdeas();
	        $scope.phase = 2;
	        $scope.$apply();
	        break;
	    case 2:
	    	console.log("Voting over")
	    	$scope.currentRound++
	    	if($scope.question != "No ideas submitted")
		    {
		    	console.log("hello")
		    	$scope.mode = 8;
		   		$scope.question = "Voting over"
		   		$scope.$apply();
		   		$timeout(function() {$scope.nextRound() , 5500})
		   	}
		   	else
		   	{
		   		console.log("hello2")
		   		$scope.nextRound()
		   	}
	    	
	    	$scope.$apply();
	    	break;
	    case 3:
	    	$scope.currentRound++
	    	$scope.requestUberIdeas();
	    	$scope.phase = 4;
	    	$scope.$apply();
	    	break;
	    case 4:
	    	$scope.mode = 8;
	    	$scope.question = "Game over"
	    	$scope.$apply();
	    	break;
	    default:
	        break;
    	}
	}

}
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
		"http://jackie.elrok.com" + '/games/show', {game:$scope.gameID}
			)
		.then(function (res) {
			if(res.data.error)
				alert("Not ready")
			else
			{
				$scope.game = res.data.game
				$scope.input_timer = res.data.game.input_timer
				$scope.battle_timer = res.data.game.battle_timer
				$scope.rounds = res.data.game.rounds
				$scope.questions = res.data.questions;
				$scope.ideaTitleSwap();
				$scope.mode=1
		        $scope.currentTime = $scope.game.input_timer-1;
				$('#timer').html($scope.currentTime + ' second(s)');
				var interval = setInterval(function()
				{ 
				  $scope.currentTime = $scope.currentTime-$scope.decrement;
				  $('#timer').html($scope.currentTime + ' second(s)');
				  if ($scope.currentTime <= 0)
						clearInterval(interval);
				}, 1000);
				console.log(res.data)
			}
			});
}
$scope.submitIdea = function() {
	//Temp just put in array
	$http.post(
		"http://jackie.elrok.com" + '/ideas/create', {"idea": $scope.idea, "game":$scope.game.id, round: $scope.currentRound, player:$scope.playerID}
			)
		.then(function (res) {
				if(!res.data.error)
				{
					$scope.idea = {};
					$scope.mode = 0
					$scope.question = ""
				}
				else
				{
					alert("Too late to submit")
				}

			});
	console.log($scope.ideas);
	
	
};

$scope.submitUberIdea = function() {
	$http.post(
		"http://jackie.elrok.com" + '/uber_ideas/create', {uber_idea: {description:$('#uberIdeaBox').val(), player_id: $scope.playerID}, game:$scope.game.id}
			)
	.then(function (res) {
				if(!res.data.error)
				{
					$scope.mode = 0;
					$scope.question = ""
				}
				else
				{
					alert("Too late to submit")
				}
			})
};


$scope.ideaFromId = function (id_s) {
		for(var i=0;i<$scope.ideas.length;i++) 
	    if($scope.ideas[i].id==id_s) 
	        return $scope.ideas[i]
}


$scope.requestIdeas = function () {
	console.log("called")
	$http.post(
		"http://jackie.elrok.com" + '/ideas/index', {game: $scope.game.id, round: $scope.currentRound}
			)
		.then(function (res) {
			if(!res.data.error)
			{
				$scope.ideas = res.data.ideas
				$scope.mode = 2;
				console.log($scope.ideas);
				$scope.question = "Choose a victor"
				$scope.fights[0] = $scope.ideas
				$scope.currentFight = 0;
				$scope.currentTime = $scope.game.battle_timer-1;
				$('#battle_timer').html($scope.currentTime + ' second(s)');
				var interval = setInterval(function()
				{ 
				  $scope.currentTime = $scope.currentTime-$scope.decrement;
				  $('#battle_timer').html($scope.currentTime + ' second(s)');
				  if ($scope.currentTime <= 0)
						clearInterval(interval);
				}, 1000);
			}
			else
				{
					$scope.mode = 8;
					$scope.question = "No ideas submitted"
				}
			})
	
}

$scope.requestUberIdeas = function () {
	$http.post(
		"http://jackie.elrok.com" + '/uber_ideas/index', {game: $scope.game.id, round:$scope.currentRound}
			)
		.then(function (res) {
			if(!res.data.error)
			{
				$scope.uberIdeas = res.data.uber_ideas
				$scope.mode = 5;
				console.log($scope.uberIdeas);
				$scope.question = "Choose a victor"
				$scope.currentTime = $scope.game.battle_timer-1;
				$('#uber_battle_timer').html($scope.currentTime + ' second(s)');
				var interval = setInterval(function()
				{ 
				  $scope.currentTime = $scope.currentTime-$scope.decrement;
				  $('#uber_battle_timer').html($scope.currentTime + ' second(s)');
				  if ($scope.currentTime <= 0)
						clearInterval(interval);
				}, 1000);
			}
			else
				{
					$scope.mode = 8;
					$scope.question = "Game over"
				}
			})
	
}

$scope.voteFor = function(whoId) {
	//Temp just put in array
	
	$scope.vote = whoId;
	console.log($scope.vote);
	$http.post(
		"http://jackie.elrok.com" + '/ideas/vote', {game: $scope.game.id, id:$scope.vote, player: $scope.playerID}
			).then(function (res) {
				if(!res.data.error)
				{
					$scope.mode = 0;
					$scope.question = ""
					$scope.currentRound++
				}
				else if(res.data.error == 2)
					alert("Can't vote for yourself")
				else
				{
					alert("Too late to vote")
				}
			})
	//$scope.winners.push($scope.ideas[1]);
};

$scope.uberVoteFor = function(whoId) {
	//Temp just put in array
	$scope.vote = whoId;
	console.log($scope.vote);
	$http.post(
		"http://jackie.elrok.com" + '/uber_ideas/vote', {game: $scope.game.id, id:$scope.vote, player: $scope.playerID}
			).then(function (res) {
				if(!res.data.error)
				{
					$scope.mode = 8;
					$scope.question = "Game over"
					$scope.currentRound++
				}
				else if(res.data.error == 2)
					alert("Can't vote for yourself")
				else
				{
					alert("Too late to vote")
				}
			})
	$scope.currentRound++
	//$scope.winners.push($scope.ideas[1]);
};

$scope.nextRound = function() {

		$scope.ideaTitleSwap();
		if($scope.currentRound*1 <= $scope.rounds*1)
			{
				$scope.mode = 1;
				$scope.phase = 1;
				$scope.currentTime = $scope.game.input_timer-1;
				$('#timer').html($scope.currentTime + ' second(s)');
				var interval = setInterval(function()
				{ 
				  $scope.currentTime = $scope.currentTime-$scope.decrement;
				  $('#timer').html($scope.currentTime + ' second(s)');
				  if ($scope.currentTime <= 0)
						clearInterval(interval);
				}, 1000);
			}
		else
			$scope.goUberRound()
}

$scope.goUberRound = function() {
	$scope.phase = 3;
	$http.post(
		"http://jackie.elrok.com" + '/ideas/request_winners', {game: $scope.game.id}
			).then(function (res) {
				console.log(res.data)
				$scope.winners = res.data
			})
	$scope.question = "Combine the winners"
	$scope.mode = 4;
	$scope.currentFight++
	$scope.currentTime = $scope.game.input_timer-1;
				$('#uber_timer').html($scope.currentTime + ' second(s)');
				var interval = setInterval(function()
				{ 
				  $scope.currentTime = $scope.currentTime-$scope.decrement;
				  $('#uber_timer').html($scope.currentTime + ' second(s)');
				  if ($scope.currentTime <= 0	)
						clearInterval(interval);
				}, 1000);
}

$scope.ideasUsed = function() {
	var text = $('#uberIdeaBox').val().toLowerCase();
	var counter = 0;
	for (var i = 0; i < $scope.winners.length; i++)
		if(text.indexOf($scope.winners[i].name.toLowerCase()) != -1)
			counter++;

	return counter;
}


$scope.appendChampion = function(champion) {
	$('#uberIdeaBox').val($('#uberIdeaBox').val()+champion);
}


}]);