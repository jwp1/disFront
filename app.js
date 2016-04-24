'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('brainstrom', [
  'ngRoute',
  'brainstrom.play',
  'brainstrom.menu',
  'brainstrom.host' 
]);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/menu'});
}]);

app.factory('playerID', function() {
 var savedData;
 function set(data) {
   savedData = data;
 }
 function get() {
  return savedData;
 }

 return {
  set: set,
  get: get
 }

})
app.factory('gameID', function() {
 var savedData;
 function set(data) {
   console.log("GameID: "+data)
   savedData = data;
 }
 function get() {
  return savedData;
 }

 return {
  set: set,
  get: get
 }

});