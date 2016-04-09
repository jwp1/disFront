'use strict';

angular.module('myApp.view2', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view2', {
    templateUrl: 'view2/view2.html',
    controller: 'View2Ctrl'
  });
}])

.controller('View2Ctrl', ['$scope', '$http',function($scope, $http) {
	$scope.selected = 0;

	$scope.room = {};
	$scope.room.rounds = 3;
	$scope.room.input_timer = 10;
	$scope.room.battle_timer = 5;
	$scope.room.questions = {};

	$scope.genArray = function(num) {
    return new Array(num);   
	}

	$scope.createGame = function (room) {
		console.log($scope.room.questions)
	$http.post(
		"http://localhost:3457" + '/games/create', {game:room}
			)
		.then(function (res) {
			alert("woo")
			})
	
}

}]);