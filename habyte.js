var habyteApp = angular.module('habyteApp',['ngRoute']);

habyteApp.config(['$routeProvider',function(route){
	route.
		when('/day',{
			templateUrl:'day.html',
			controller: 'dayCtrl'
		}).
		otherwise({
			redirectTo: '/day'
		});
}]);

habyteApp.controller('dayCtrl',['$scope',function(scope){
	scope.tasks = [{
		name: 'Run',
		number: 0,
		goal: 5
	},{
		name: 'Read',
		number: 0,
		goal: 3
	},{
		name: 'Exercise',
		number: 0,
		goal: 4
	}];


	scope.addTask = function(){
		var newTask = {
			name:scope.newName,
			number:0,
			goal:scope.newGoal
		};

		scope.tasks.push(newTask);

		scope.newGoal='';
		scope.newName='';
	};

	scope.removeTask = function(name){
		var task = scope.tasks.filter(function(entry){
			return entry.name === name;
		})[0];

		var i = scope.tasks.indexOf(task);

		scope.tasks.splice(i,1);
	};

	scope.incrementCounter = function(name){
		var task = scope.tasks.filter(function(entry){
			return entry.name === name;
		})[0];

		var i = scope.tasks.indexOf(task);

		scope.tasks[i].number += 1;
	}

	scope.decrementCounter = function(name){
		var task = scope.tasks.filter(function(entry){
			return entry.name === name;
		})[0];

		var i = scope.tasks.indexOf(task);

		scope.tasks[i].number -= 1;
	}

}]);