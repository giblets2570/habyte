var habyteApp = angular.module('habyteApp',['ngRoute','ngStorage','tc.chartjs','habyteControllers']);

habyteApp.config(['$routeProvider',function(route){
	route.
		when('/:userUID/day',{
			templateUrl:'partials/day.html',
			controller: 'dayCtrl'
		}).
		when('/:userUID/timeline',{
			templateUrl:'partials/timeline.html',
			controller: 'timelineCtrl'
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

	factory.timeline = function(userUID,callback){
		http({
			method:'GET',
			params:{userUID: userUID},
			url:'endpoints/getTaskTimeline.php',
			cache:false
		}).success(callback);
	}

	factory.getTasks = tasks;

	return factory;
}]);

habyteApp.directive('timelineDir',function(){
	return{
		scope:{
			taskName: '@'
		},
		template: '{{taskName}}',
	}
});