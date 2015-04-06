<?php
	$postdata = file_get_contents("php://input");
	$request = json_decode($postdata);
	$userID = $request->userUID;
	$task = $request->task;

	include 'db.php';

	$mysqli = new mysqli($servername, $serverusername, $serverpassword, $db);

    if ($mysqli->connect_errno) {
        printf("Connect failed: %s\n", $mysqli->connect_error);
        $result['success'] = 0;
		echo json_encode($result);
        exit();
    }
    $date = date("Y-m-d");
	$sql = "select * from Tasks where userID='$userID'";
	$query = $mysqli->query($sql);

	if( $query){
		// Sweet
		$numrows = $query->num_rows;

		if($numrows === 0){
			//add task into task table
			$tasks = array();
			$tasks[] = $task;
			$json_task = json_encode($tasks);
			$sql = "insert into Tasks(id,userID,tasks,date) values (NULL,'$userID','$json_task','$date')";
			$query = $mysqli->query($sql);

			if ($query){
				//pass

			}else{
				$result['success'] = -1;
				echo json_encode($result);
				exit();
			}

			//add task in task timeline table
			$sql = "select * from Tasks where userID='$userID'";
			$query = $mysqli->query($sql);
			if($query){
				$row = $query->fetch_assoc();

				$taskID = $row['id'];
				$taskName =$task['name'];
				$timeline = json_encode(array());
				$sql = "insert into TaskLimeline(id,taskID,taskName,timeline,startDate,endDate) values (NULL,'$taskID','$taskName','$timeline','$date',NULL)";
				$query = $mysqli->query($sql);

				if($query){
					$result['success'] = 3;
					echo json_encode($result);
					exit();
				}else{
					echo $mysqli->error;
					$result['success'] = -3;
					echo json_encode($result);
					exit();
				}

			}else{
				$result['success'] = -2;
				echo json_encode($result);
				exit();
			}
		}else{

			$row = $query->fetch_assoc();
			$id = $row['id'];
			$json_tasks = $row['tasks'];
			$tasks = json_decode($json_tasks);
			$tasks[] = $task;
			$json_tasks = json_encode($tasks);
			$sql = "update Tasks set tasks='$json_tasks' where id='$id'";
			$query = $mysqli->query($sql);
			if ($query){
				//pass

				//add task in task timeline table

				$taskID = $id;
				$task = json_decode(json_encode($task),true);
				$taskName =$task['name'];

				$sql = "insert into TaskTimeline(id,taskID,taskName,timeline,startDate,endDate) values(NULL,'$taskID','$taskName','[]','$date',NULL)";
				$query = $mysqli->query($sql);

				if($query){
					$result['success'] = 3;
					echo json_encode($result);
					exit();
				}else{
					echo $mysqli->error;
					$result['success'] = -3;
					echo json_encode($result);
					exit();
				}

			

			}else{
				$result['success'] = -1;
				echo json_encode($result);
				exit();
			}
		}
	}else{
		//echo "Error: " . $sql . "<br>" . $mysqli->error;
		echo '4';
		exit();
	}
	
	$result = array();
	$result['success'] = 1;
	echo json_encode($result);
	
?>

