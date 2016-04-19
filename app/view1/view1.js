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
var interval;
	
var dispatcher = new WebSocketRails('jackie.elrok.com/websocket');
var channel = dispatcher.subscribe('sockets');
channel.bind('next', function(data) {
  $scope.nextPhase(data);
});

dispatcher.trigger('player_joined', {game_id:$scope.gameID})

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
	console.log($scope.phase)
	console.log("----")
	if(interval)
		clearInterval(interval);
	console.log(data)
	if($scope.game == undefined || data.game_id == $scope.game.id)
	{
		switch($scope.phase) {
	    case 0:
	        $scope.loadGame(data);
	        $scope.phase = 1;
	        $scope.$apply();
	        break;
	    case 1:
	        $scope.requestIdeas(data);
	        $scope.phase = 2;
	        $scope.$apply();
	        break;
	    case 2:
	    	$scope.phase = 5;
	    	$scope.currentRound++
	    	$scope.mode = 8;
	   		$scope.question = "Voting over"
	   		$scope.$apply();
	    	break;
	    case 3:
	    	$scope.currentRound++
	    	$scope.requestUberIdeas(data);
	    	$scope.phase = 4;
	    	$scope.$apply();
	    	break;
	    case 4:
	    	$scope.mode = 8;
	    	$scope.question = "Game over"
	    	dispatcher.disconnect();
	    	$scope.$apply();
	    	break;
    	case 5:
    		console.log("in case")
	    	$scope.nextRound(data)
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

$scope.loadGame = function (data) {
	$scope.game = data.game
	$scope.input_timer = data.game.input_timer
	$scope.battle_timer = data.game.battle_timer
	$scope.rounds = data.game.rounds
	$scope.questions = data.questions;
	$scope.ideaTitleSwap();
	$scope.mode=1
    $scope.currentTime = $scope.game.input_timer;
	$('#timer').html($scope.currentTime + ' second(s)');
	interval = setInterval(function()
	{ 
	  $scope.currentTime = $scope.currentTime-$scope.decrement;
	  $('#timer').html($scope.currentTime + ' second(s)');
	  if ($scope.currentTime <= 0)
			clearInterval(interval);
	}, 1000);
}
$scope.submitIdea = function() {
	//Temp just put in array
	dispatcher.trigger('submit_idea', {"idea": $scope.idea, "game":$scope.game.id, round: $scope.currentRound, player:$scope.playerID},
		function(data) 
		{
			$scope.idea = {};
			$scope.mode = 0
			$scope.question = ""
			$scope.$apply();		
		},
		function(data) 
		{
			alert("Too late to submit")	
		}
	)
};

$scope.submitUberIdea = function() {
	dispatcher.trigger('submit_uber_idea', {uber_idea: {description:$('#uberIdeaBox').val(), player_id: $scope.playerID}, game:$scope.game.id},
		function(data) 
		{
			$scope.mode = 0
			$scope.question = ""
			$scope.$apply();	
		},
		function(data) 
		{
			alert("Too late to submit")	
		}
	)
};


$scope.ideaFromId = function (id_s) {
		for(var i=0;i<$scope.ideas.length;i++) 
	    if($scope.ideas[i].id==id_s) 
	        return $scope.ideas[i]
}


$scope.requestIdeas = function (data) {

	if(!data.error)
	{
		$scope.ideas = data.ideas
		$scope.mode = 2;
		console.log($scope.ideas);
		$scope.question = "Choose a victor"
		$scope.fights[0] = $scope.ideas
		$scope.currentFight = 0;
		$scope.currentTime = $scope.game.battle_timer-1;
		$('#battle_timer').html($scope.currentTime + ' second(s)');
		interval = setInterval(function()
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
	
}

$scope.requestUberIdeas = function (data) {

	if(!data.error)
	{
		$scope.uberIdeas = data.uber_ideas
		$scope.mode = 5;
		console.log($scope.uberIdeas);
		$scope.question = "Choose a victor"
		$scope.currentTime = $scope.game.battle_timer-1;
		$('#uber_battle_timer').html($scope.currentTime + ' second(s)');
		interval = setInterval(function()
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
			dispatcher.disconnect();
		}
	
}


$scope.voteFor = function(whoId) {
	//Temp just put in array
	$scope.vote = whoId;
	console.log($scope.vote);
	dispatcher.trigger('vote', {game: $scope.game.id, id:$scope.vote, player: $scope.playerID},function(data) {
		console.log("hello")
	  	$scope.mode = 0;
	  	$scope.question = ""
	  	$scope.$apply();
	},function(data) {
	  if(data.error == 2)
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
	dispatcher.trigger('vote_uber', {game: $scope.game.id, id:$scope.vote, player: $scope.playerID},
		function(data) 
			{
				$scope.mode = 8;
				$scope.question = "Game over"
				dispatcher.disconnect();
				$scope.$apply()
			},function(data) {
			  if(data.error == 2)
			  	alert("Can't vote for yourself")
			  else
			  {
			  	alert("Too late to vote")
			  }
			})
	$scope.currentRound++
	//$scope.winners.push($scope.ideas[1]);
};

$scope.nextRound = function(data) {

		$scope.ideaTitleSwap();
		console.log("in nextround")
		if(data.uber == undefined)
			{
				$scope.mode = 1;
				$scope.phase = 1;
				$scope.currentTime = $scope.game.input_timer-1;
				$('#timer').html($scope.currentTime + ' second(s)');
				interval = setInterval(function()
				{ 
				  $scope.currentTime = $scope.currentTime-$scope.decrement;
				  $('#timer').html($scope.currentTime + ' second(s)');
				  if ($scope.currentTime <= 0)
						clearInterval(interval);
				}, 1000);
			}
		else
			$scope.goUberRound(data)
}

$scope.goUberRound = function(data) {
	$scope.phase = 3;
	$scope.winners = data.winners
	$scope.question = "Combine the winners"
	$scope.mode = 4;
	$scope.currentFight++
	$scope.currentTime = $scope.game.input_timer-1;
				$('#uber_timer').html($scope.currentTime + ' second(s)');
				interval = setInterval(function()
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