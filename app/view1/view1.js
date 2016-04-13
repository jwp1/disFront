'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', '$http', 'playerID' ,function($scope, $http, playerID) {


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
$scope.rounds = 0;
$scope.uberIdea = ""
$scope.playerID = playerID.get();



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
		"http://jackie.elrok.com" + '/games/show', {test: "yes"}
			)
		.then(function (res) {
			if(res.data.error)
				alert("Not ready")
			else
			{
				$scope.game = res.data.game
				$scope.rounds = res.data.game.rounds
				$scope.questions = res.data.questions;
				$scope.ideaTitleSwap();
				$scope.mode=1
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
				if(res.data.error)
					alert("Idea already entered")
				else
					{
						$scope.mode = 6
						$scope.question = ""
					}

			});
	console.log($scope.ideas);
	
	
};


$scope.ideaFromId = function (id_s) {
		for(var i=0;i<$scope.ideas.length;i++) 
	    if($scope.ideas[i].id==id_s) 
	        return $scope.ideas[i]
}


$scope.requestIdeas = function () {
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
			}
			else
				alert("Too early!")
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
			}
			else
				alert("Too early!")
			})
	
}

$scope.voteFor = function(whoId) {
	//Temp just put in array
	
	$scope.vote = whoId;
	console.log($scope.vote);
	$http.post(
		"http://jackie.elrok.com" + '/ideas/vote', {game: $scope.game.id, id:$scope.vote, player: $scope.playerID}
			).then(function (res) {
				if(res.data.error == 0)
				{
					$scope.mode = 3;
					$scope.question = ""
					$scope.currentRound++
				}
				else if(res.data.error == 1)
					alert("Can't vote for yourself")
				else
					{
						$scope.mode = 3;
						$scope.question = ""
						$scope.currentRound++
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
				if(res.data.error == 0)
				{
					$scope.mode = 8;
					$scope.question = ""
					$scope.currentRound++
				}
				else if(res.data.error == 1)
					alert("Can't vote for yourself")
				else
					{
						$scope.mode = 3;
						$scope.question = ""
						$scope.currentRound++
					}
			})
	$scope.currentRound++
	//$scope.winners.push($scope.ideas[1]);
};

$scope.testNext = function() {
	$http.post(
		"http://jackie.elrok.com" + '/ideas/winner_decided', {game: $scope.game.id, round: $scope.currentRound}
			).then(function (res) {
				if(!res.data.error)
				{
					$scope.ideaTitleSwap();
					if($scope.currentRound*1 <= $scope.rounds*1)
						$scope.mode = 1;
					else
						$scope.goUberRound()
				}
				else
					alert("Too early!")
			})
}

$scope.goUberRound = function() {
	$http.post(
		"http://jackie.elrok.com" + '/ideas/request_winners', {game: $scope.game.id}
			).then(function (res) {
				console.log(res.data)
				$scope.winners = res.data
			})
	$scope.question = "Combine the winners"
	$scope.mode = 4;
	$scope.currentFight++
}

$scope.ideasUsed = function() {
	var text = $('#uberIdeaBox').val().toLowerCase();
	var counter = 0;
	for (var i = 0; i < $scope.winners.length; i++)
		if(text.indexOf($scope.winners[i].name.toLowerCase()) != -1)
			counter++;

	return counter;
}

$scope.submitUberIdea = function() {
	$http.post(
		"http://jackie.elrok.com" + '/uber_ideas/create', {uber_idea: {description:$('#uberIdeaBox').val(), player_id: $scope.playerID}, game:$scope.game.id}
			)
	console.log($scope.uberIdeas);
	$scope.mode = 7;
	$scope.question = ""
};

$scope.appendChampion = function(champion) {
	$('#uberIdeaBox').val($('#uberIdeaBox').val()+champion);
}

if(!$scope.playerID)
	{
		console.log($scope.playerID)
		$scope.question = "Error joining"
		$scope.mode = 99
	}

}]);