'use strict';

// Declare app level module which depends on views, and components
angular.module('brainstrom', [
  'ngRoute',
  'brainstrom.play',
  'brainstrom.menu',
  'brainstrom.host'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/menu'});
}])
.factory('playerID', function() {
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
.factory('gameID', function() {
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