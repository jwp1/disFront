'use strict';

angular.module('myApp.view2', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view2', {
    templateUrl: 'view2/view2.html',
    controller: 'View2Ctrl'
  });
}])

.controller('View2Ctrl', ['$scope', '$http', '$location', 'playerID', 'gameID', function($scope, $http, $location, playerID, gameID) {
	$scope.selected = 0;
	$scope.room = {};
	$scope.room.player_count = 1;
	$scope.room.rounds = 1;
	$scope.room.input_timer = 10;
	$scope.room.battle_timer = 5;
	$scope.room.questions = {};

	$scope.genArray = function(num) {
    return new Array(num);   
	}

	$scope.createGame = function (room) {
		console.log($scope.room.questions)
		$http.post(
		"http://jackie.elrok.com" + '/games/create', {game:room}
			)
		.then(function (res) {
			gameID.set(res.data.game)
			$location.path('/view3');
			if(res.data.error)
				alert("Error creating game")
			
			})
	
	}

	$scope.joinGame = function (player) {
		$http.post(
		"http://jackie.elrok.com" + '/player/join', {player:player}
			)
		.then(function (res) {
			if(res.data.error)
			{
				alert("Can't join, game full/started or no name entered")
			}
			else if(res.data.duplicate)
			{
				alert("Someone already has that name!")
			}
			else
			{
				playerID.set(res.data.player)
				gameID.set(res.data.game)
				$location.path('/view1');
			}
			})
	}

}]);