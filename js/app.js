var habyteApp = angular.module('habyteApp',['ngRoute','ngStorage']);

habyteApp.config(['$routeProvider',function(route){
	route.
		when('/:userUID/day',{
			templateUrl:'partials/day.html',
			controller: 'dayCtrl'
		}).
		when('/login',{
			templateUrl:'partials/login.html',
			controller: 'authCtrl'
		}).
		when('/signup',{
			templateUrl:'partials/signup.html',
			controller: 'authCtrl'
		}).
		otherwise({
			redirectTo: '/login'
		});
}]);

habyteApp.factory('userTasks',['$http',function(http){
	var factory = {};

	var tasks = function(userUID,callback){
		http({
			method:'GET',
			params:{userUID: userUID},
			url:'endpoints/getTasks.php',
			cache:false
		}).success(callback);
	};

	var post = function(userUID,data,url,callback){
		http({
			method:'POST',
			data: data,
			url:url
		}).success(function(data,status,headers){
			console.log(data);
			tasks(userUID,callback);
		});
	};

	factory.addTask = function(userUID,newTask,callback){
		post(userUID,{userUID:userUID,task:newTask},'endpoints/addTask.php',callback);
	};

	factory.removeTask = function(userUID,oldTaskIndex,callback){
		post(userUID,{userUID:userUID,taskIndex:oldTaskIndex},'endpoints/removeTask.php',callback);
	};

	factory.increment = function(userUID,taskIndex,callback){
		post(userUID,{userUID:userUID,taskIndex:taskIndex},'endpoints/increment.php',callback);
	};

	factory.decrement = function(userUID,taskIndex,callback){
		post(userUID,{userUID:userUID,taskIndex:taskIndex},'endpoints/decrement.php',callback);
	};

	factory.getTasks = tasks;

	return factory;
}]);

habyteApp.run(function ($rootScope, $location, $sessionStorage){
	$rootScope.$on("$routeChangeStart", function (event, next, current) {
        $rootScope.authenticated = false;
        if ($sessionStorage.uid) {
            $rootScope.authenticated = true;
            $rootScope.uid = $sessionStorage.uid;
            $rootScope.name = $sessionStorage.name;
        } else {
            var nextUrl = next.$$route.originalPath;
            if (nextUrl == '/signup' || nextUrl == '/login') {

            } else {
                $location.path("/login");
            }
        }
    });
});

habyteApp.controller('authCtrl',['$scope','$sessionStorage','$location','$http',function(scope,session,location,http){

	scope.login = function(){
		http({
			method: 'GET',
			url: 'endpoints/login.php',
			params: {username: scope.username, password: scope.password},
			cache: false
		}).success(function(data){
			console.log(data);
			if(data.uid != -1){
				session.uid = data.uid;
				location.path(session.uid+'/day');
			}else{
				alert("Wrong username/password");
				scope.username = "";
				scope.password = "";
			}
		});
	};

	scope.signup = function(){
		http({
			method: 'POST',
			url: 'endpoints/signup.php',
			data: {username: scope.username, password: scope.password},
		}).success(function(data){
			console.log(data);
			if(data.uid != -1){
				session.uid = data.uid;
				location.path(session.uid+'/day');
			}else{
				alert("Username already exists!");
				scope.username = "";
				scope.password = "";
			}
		});
	}

}]);

habyteApp.controller('dayCtrl',['$scope','$routeParams','$sessionStorage','$location','userTasks',function(scope,routeParams,session,location,ut){

	scope.init = function(){
		if(routeParams.userUID != session.uid){
			location.path(session.uid + "/day");
		}
	}

	scope.init();

	ut.getTasks(session.uid,function(data){
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

			ut.addTask(session.uid,newTask,function(data){
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

		ut.removeTask(session.uid,i,function(data){
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

		ut.increment(session.uid,i,function(data){
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
			ut.decrement(session.uid,i,function(data){
				console.log(data);
			});
		}
	}

	scope.logout = function(){
		session.uid = null;
		location.path('login');
	}

}]);