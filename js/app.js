var habyteApp = angular.module('habyteApp',['ngRoute']);

habyteApp.config(['$routeProvider',function(route){
	route.
		when('/:userUID/day',{
			templateUrl:'partials/day.html',
			controller: 'dayCtrl'
		}).
		when('/login',{
			templateUrl:'partials/login.html',
		}).
		when('/signup',{
			templateUrl:'partials/signup.html',
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
			cache:false
		}).success(callback);
	};

	var post = function(data,url,callback){
		http({
			method:'POST',
			data: data,
			url:url
		}).success(function(data,status,headers){
			console.log(data);
			tasks(callback);
		});
	};

	factory.addTask = function(newTask,callback){
		post({task:newTask},'endpoints/addTask.php',callback);
	};

	factory.removeTask = function(oldTaskIndex,callback){
		post({taskIndex:oldTaskIndex},'endpoints/removeTask.php',callback);
	};

	factory.increment = function(taskIndex,callback){
		post({taskIndex:taskIndex},'endpoints/increment.php',callback);
	};

	factory.decrement = function(taskIndex,callback){
		post({taskIndex:taskIndex},'endpoints/decrement.php',callback);
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

		ut.increment(i,function(data){
			console.log(data);
		});

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
		
		if(scope.tasks[i].number-1 >= scope.tasks[i].goal){
			scope.tasks[i].success = 'success';
		}else{
			scope.tasks[i].success = '';
		}

		if(scope.tasks[i].number > 0){
			scope.tasks[i].number -= 1;
			ut.decrement(i,function(data){
				console.log(data);
			});
		}
	}

}]);