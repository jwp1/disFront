'use strict';

angular.module('brainstrom.menu', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/menu', {
    templateUrl: 'menu/menu.html',
    controller: 'MenuCtrl'
  });
}])

.controller('MenuCtrl', ['$scope', '$http', '$location', 'playerID', 'gameID', function($scope, $http, $location, playerID, gameID) {
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
		$http.post(
		"http://jackie.elrok.com" + '/games/create', {game:room}
			)
		.then(function (res) {
			gameID.set(res.data.game)
			$location.path('/host');
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
				gameID.set(player.room)
				$location.path('/play');
			}
			})
	}

}]);