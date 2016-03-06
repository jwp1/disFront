'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope',function($scope) {


$scope.question = "Enter an idea";
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
$scope.uberIdea = ""


// Temp variables
$scope.ideas = [];
$scope.ideas[0] = {name: "Google", description: "A search engine"};
$scope.ideas[1] = {name: "Yahoo", description: "Another search engine"};
$scope.uberIdeas = [];
$scope.uberIdeas[0] = {id:0, description: "The functionality of google but with the aesthetic of yahoo",strength:2};

$scope.submitIdea = function() {
	//Temp just put in array
	$scope.ideas.push($scope.idea);
	console.log($scope.ideas);
	$scope.fights[0] = []
	$scope.fights[1] = []
	$scope.fights[0][0] = 0;
	$scope.fights[0][1] = 2;
	$scope.fights[1][0] = 3;
	$scope.currentFight = $scope.fights[0];
	$scope.mode = 2;
	$scope.question = "Choose a victor"
};

$scope.voteFor = function(whoId) {
	//Temp just put in array
	$scope.vote = $scope.ideas[$scope.currentFight[whoId]];
	console.log($scope.vote);
	$scope.winners.push($scope.ideas[$scope.currentFight[whoId]]);
	$scope.winners.push($scope.ideas[1]);
	$scope.currentWinner = $scope.ideas[$scope.currentFight[whoId]];
	$scope.currentWinner.votes = 1;
	$scope.mode = 3;
	$scope.question = "Winner!"
};

$scope.testNext = function() {
	$scope.question = "Combine the winners"
	$scope.mode = 4;
}

$scope.ideasUsed = function() {
	var text = this.uberIdea.toLowerCase();
	var counter = 0;
	for (var i = 0; i < $scope.winners.length; i++)
		if(text.indexOf($scope.winners[i].name.toLowerCase()) != -1)
			counter++;

	return counter;
}

$scope.submitUberIdea = function(form) {
	//Temp just put in array
	$scope.uberIdeas.push({id:1,description:form,strength:1});
	console.log($scope.uberIdeas);
	$scope.mode = 5;
	$scope.question = "Choose a final victor"
};

}]);