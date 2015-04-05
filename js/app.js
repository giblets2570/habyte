var habyteApp = angular.module('habyteApp',['ngRoute']);

habyteApp.config(['$routeProvider',function(route){
	route.
		when('/day',{
			templateUrl:'partials/day.html',
			controller: 'dayCtrl'
		}).
		otherwise({
			redirectTo: '/day'
		});
}]);

habyteApp.factory('userTasks',['$http',function(http){
	var factory = {};

	var tasks = function(callback){
		http({
			method:'GET',
			url:'endpoints/getTasks.php',
			cache:true
		}).success(callback);
	};

	factory.addTask = function(newTask,callback){
		http({
			method:'POST',
			data: {task:newTask},
			url:'endpoints/addTask.php'
		}).success(function(data,status,headers){
			tasks(callback);
		});
	};

	factory.removeTask = function(oldTaskIndex,callback){
		http({
			method:'POST',
			data: {taskIndex:oldTaskIndex},
			url:'endpoints/removeTask.php'
		}).success(function(data,status,headers){
			console.log(data);
			
			tasks(callback);
		});
	};

	factory.getTasks = tasks;

	return factory;
}]);

habyteApp.controller('dayCtrl',['$scope','userTasks',function(scope,ut){

	ut.getTasks(function(data){
		scope.tasks = data;
	});

	scope.achieved = function(task){
		if(task.number >= task.goal){
			return 'success';
		}
		return '';
	}

	scope.addTask = function(){
		if (!scope.newName){
			alert("Name field empty.");
		}
		else if(isNaN(scope.newGoal)){
			alert("Goal not a number.");
		}
		else if(scope.newGoal < 1){
			alert("Goal too easy to achieve.");
		}
		else{
			var newTask = {
				name:scope.newName,
				number:0,
				goal:Number(scope.newGoal)
			};

			ut.addTask(newTask,function(data){
				console.log(data);
			});

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

		ut.removeTask(i,function(data){
			console.log(data);
		});

		scope.tasks.splice(i,1);
	};

	scope.incrementCounter = function(name){
		var task = scope.tasks.filter(function(entry){
			return entry.name === name;
		})[0];

		var i = scope.tasks.indexOf(task);

		scope.tasks[i].number += 1;

		if(scope.tasks[i].number >= scope.tasks[i].goal){
			scope.tasks[i].success = 'success';
		}else{
			scope.tasks[i].success = '';
		}
	}

	scope.decrementCounter = function(name){

		var task = scope.tasks.filter(function(entry){
			return entry.name === name;
		})[0];

		var i = scope.tasks.indexOf(task);
		if(scope.tasks[i].number > 0){
			scope.tasks[i].number -= 1;
		}
		if(scope.tasks[i].number >= scope.tasks[i].goal){
			scope.tasks[i].success = 'success';
		}else{
			scope.tasks[i].success = '';
		}
	}

}]);