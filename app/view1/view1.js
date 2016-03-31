'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', '$http',function($scope, $http) {


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
	$http.post(
		"http://localhost:3457" + '/ideas/create', {"idea": $scope.idea}
			);
	console.log($scope.ideas);
	
	
};


$scope.ideaFromId = function (id_s) {
		for(var i=0;i<$scope.ideas.length;i++) 
	    if($scope.ideas[i].id==id_s) 
	        return $scope.ideas[i]
}

$scope.requestIdeas = function () {
	$http.post(
		"http://localhost:3457" + '/ideas/index', {test: "yes"}
			)
		.then(function (res) {
			$scope.ideas = res.data.ideas
			$scope.mode = 2;
			console.log($scope.ideas);
			$scope.question = "Choose a victor"
			$scope.fights[0] = []
			$scope.fights[1] = []
			$scope.fights[2] = []
			$scope.fights[0][0] = 1;
			$scope.fights[0][1] = 2;
			$scope.fights[1][0] = 3;
			$scope.fights[1][1] = 4;
			$scope.fights[2][0] = 2;
			$scope.fights[2][1] = 3;
			$scope.currentFight = 0;
			})
	
}

$scope.voteFor = function(whoId) {
	//Temp just put in array
	
	$scope.vote = whoId;
	console.log($scope.vote);
	$http.post(
		"http://localhost:3457" + '/ideas/vote', {id:$scope.vote}
			).then(function (res) {
				$http.post(
					"http://localhost:3457" + '/ideas/request_winner', {ids:[$scope.fights[$scope.currentFight][0], $scope.fights[$scope.currentFight][1]]}
						).then(function (res) {
							console.log("data")
							console.log(res.data)
							$scope.currentWinner = res.data;
							$scope.currentWinner.votes = res.data.popularity;
							$scope.mode = 3;
							$scope.question = "Winner!"
							if($scope.currentFight == $scope.fights.length-1)
							{

								$scope.winners.push(res.data);
							}
						})
			})
	//$scope.winners.push($scope.ideas[1]);
};

$scope.testNext = function() {
	console.log($scope.winners)
	$scope.question = "Combine the winners"
	$scope.mode = 4;
	$scope.currentFight++
	if($scope.currentFight < $scope.fights.length)
	{
		$scope.mode = 2;
		$scope.question = "Choose a victor"
	}
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
	$http.post(
		"http://localhost:3457" + '/ideas/destroy_all', {test: "yes"}
			)
	//Temp just put in array
	$scope.uberIdeas.push({id:1,description:form,strength:1});
	console.log($scope.uberIdeas);
	$scope.mode = 5;
	$scope.question = "Choose a final victor"
};

}]);