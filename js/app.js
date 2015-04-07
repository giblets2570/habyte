var habyteApp = angular.module('habyteApp',['ngRoute','ngStorage','tc.chartjs']);

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
			cache: true
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

habyteApp.controller('timelineCtrl',['$scope','$routeParams','$sessionStorage','$location','userTasks',function(scope,routeParams,session,location,ut){
	scope.viewedTask = {};

	scope.init = function(){
		if(routeParams.userUID != session.uid){
			location.path(session.uid + "/timeline");
		}
	}

	scope.init();

	ut.timeline(session.uid,function(data){
		scope.timelines = data;
		for(index in data){
			var json;
			try{
				json = JSON.parse(data[index].timeline);
			}catch(err){
				json = [];
			}
			scope.timelines[index]['timeline'] = json;
		}
	});

	// Chart.js Data
    scope.myData = {
      labels: [],
      datasets: [
        {
          label: 'My First dataset',
          fillColor: 'rgba(220,220,220,0.2)',
          strokeColor: 'rgba(220,220,220,1)',
          pointColor: 'rgba(220,220,220,1)',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(220,220,220,1)',
          data: []
        }
      ]
    };

    // Chart.js Options
    scope.myOptions =  {

      // Sets the chart to be responsive
      responsive: true,

      ///Boolean - Whether grid lines are shown across the chart
      scaleShowGridLines : true,

      //String - Colour of the grid lines
      scaleGridLineColor : "rgba(0,0,0,.05)",

      //Number - Width of the grid lines
      scaleGridLineWidth : 1,

      //Boolean - Whether the line is curved between points
      bezierCurve : true,

      //Number - Tension of the bezier curve between points
      bezierCurveTension : 0.4,

      //Boolean - Whether to show a dot for each point
      pointDot : true,

      //Number - Radius of each point dot in pixels
      pointDotRadius : 4,

      //Number - Pixel width of point dot stroke
      pointDotStrokeWidth : 1,

      //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
      pointHitDetectionRadius : 20,

      //Boolean - Whether to show a stroke for datasets
      datasetStroke : true,

      //Number - Pixel width of dataset stroke
      datasetStrokeWidth : 2,

      //Boolean - Whether to fill the dataset with a colour
      datasetFill : true,

      // Function - on animation progress
      onAnimationProgress: function(){},

      // Function - on animation complete
      onAnimationComplete: function(){},

      //String - A legend template
      legendTemplate : '&lt;ul class="tc-chart-js-legend"&gt;&lt;% for (var i=0; i&lt;datasets.length; i++){%&gt;&lt;li&gt;&lt;span style="background-color:&lt;%=datasets[i].strokeColor%&gt;"&gt;&lt;/span&gt;&lt;%if(datasets[i].label){%&gt;&lt;%=datasets[i].label%&gt;&lt;%}%&gt;&lt;/li&gt;&lt;%}%&gt;&lt;/ul&gt;'
    };

	scope.myOptions =  {
	  // Chart.js options can go here.
	};

	scope.update = function(){
		console.log(scope.viewedTask);
		scope.viewedTask = scope.selectedTask;
		console.log(JSON.parse(scope.viewedTask));
		var jsonTask = JSON.parse(scope.viewedTask);
		var noDays = jsonTask.timeline.length;
		var label = [];
		for(i = 0; i < noDays; i++){
			label.push(i);
		}
		console.log(label)
		scope.myData.labels = label;
		scope.myData.datasets[0].data = jsonTask.timeline;
	}

	scope.logout = function(){
		session.uid = null;
		location.path('login');
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
		console.log(data);
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

habyteApp.directive('timelineDir',function(){
	return{
		scope:{
			taskName: '@'
		},
		template: 'Task name: {{taskName}}',
	}
});