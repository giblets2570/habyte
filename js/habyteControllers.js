angular.module('habyteControllers',[])
	.controller('authCtrl',['$scope','$sessionStorage','$location','$http',function(scope,session,location,http){

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

	}])

	.controller('timelineCtrl',['$scope','$routeParams','$sessionStorage','$location','userTasks',function(scope,routeParams,session,location,ut){
		scope.viewedTask = {};
		scope.message = "";
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
				label: 'Task Timeline',
				fillColor: 'rgba(220,220,220,0.2)',
				strokeColor: 'rgba(220,220,220,1)',
				pointColor: 'rgba(220,220,220,1)',
				pointStrokeColor: '#fff',
				pointHighlightFill: '#fff',
				pointHighlightStroke: 'rgba(220,220,220,1)',
				data: []
	        },
	        {
				label: 'Goal',
				fillColor: 'rgba(110,220,110,0.2)',
				strokeColor: 'rgba(110,220,110,1)',
				pointColor: 'rgba(110,220,110,1)',
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
			//Boolean - Whether grid lines are shown across the chart
			scaleShowGridLines : true,
			//String - Colour of the grid lines
			scaleGridLineColor : "rgba(0,0,0,.05)",
			//Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
      		scaleBeginAtZero : true,
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

		scope.update = function(){
			console.log(scope.viewedTask);
			scope.viewedTask = scope.selectedTask;
			console.log(JSON.parse(scope.viewedTask));
			var jsonTask = JSON.parse(scope.viewedTask);
			var noDays = jsonTask.timeline.length;
			var label = [];
			var goal = [];
			for(i = 0; i < noDays; i++){
				label.push(i);
				goal.push(jsonTask.taskGoal);
			}
			console.log(label)
			scope.myData.labels = label;
			scope.myData.datasets[0].data = jsonTask.timeline;
			scope.myData.datasets[1].data = goal;
			if(jsonTask.timeline.length == 0){
				scope.message = "Not enough data to display graph.";
			}else{
				scope.message = "Start Date: " + jsonTask.startDate;
				if(jsonTask.endDate){
					scope.message += ", End Date: " + jsonTask.endDate;
				}
			}
		}

		scope.logout = function(){
			session.uid = null;
			location.path('login');
		}

	}])

	.controller('dayCtrl',['$scope','$routeParams','$sessionStorage','$location','userTasks',function(scope,routeParams,session,location,ut){

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
			var r = confirm("Are you sure you want to delete " + name);
			if(r==true){
				var task = scope.tasks.filter(function(entry){
					return entry.name === name;
				})[0];

				var i = scope.tasks.indexOf(task);

				ut.removeTask(session.uid,i,function(data){
					console.log(data);
				});

				scope.tasks.splice(i,1);
			}
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