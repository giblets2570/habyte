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

habyteApp.factory('userTasks',['$http',function(http){
	var factory = {};

	factory.getTasks = function(callback){
		http.get('userTasks.json').success(callback);
	};

	return factory;
}]);

habyteApp.controller('dayCtrl',['$scope','userTasks',function(scope,ut){

	ut.getTasks(function(data){
		scope.tasks = data;
	});

	scope.addTask = function(){
		if (!scope.newName){
			alert("Name field empty.");
		}
		else if(isNaN(scope.newGoal)){
			alert("Goal not a number.")
		}
		else{
			var newTask = {
				name:scope.newName,
				number:0,
				goal:scope.newGoal
			};

			scope.tasks.push(newTask);

			scope.newGoal='';
			scope.newName='';
		}
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