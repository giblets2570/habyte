<?php
	$postdata = file_get_contents("php://input");
	$request = json_decode($postdata);
	$userID = $request->userUID;
	$taskIndex = $request->taskIndex;

	include 'db.php';

	$mysqli = new mysqli($servername, $serverusername, $serverpassword, $db);

    if ($mysqli->connect_errno) {
        printf("Connect failed: %s\n", $mysqli->connect_error);
        echo '1';
        exit();
    }

	$sql = "select * from Tasks where userID='$userID'";
	$query = $mysqli->query($sql);

	if($query){
		// Sweet
		$date = date("Y-m-d");

		$row = $query->fetch_assoc();
		$id = $row['id'];
		$json_tasks = $row['tasks'];
		$tasks = json_decode($json_tasks,true);
		$taskName =$tasks[$taskIndex]['name'];
		unset($tasks[$taskIndex]);
		$tasks = array_values($tasks);
		$json_tasks = json_encode($tasks);
		$sql = "update Tasks set tasks='$json_tasks' where id='$id'";
		$query = $mysqli->query($sql);
		if ($query){
			//pass

		}else{
			echo '3';
			exit();
		}

		$taskID = $id;

		$sql = "select * from TaskTimeline where taskID='$taskID' and taskName='$taskName'";
		$query = $mysqli->query($sql);

		if($query){
			if($query->num_rows < 1){
				$result['success'] = -1;
				echo json_encode($result);
				exit();	
			}
			$row = $query->fetch_assoc();

			$startDate = $row['startDate'];

			if($startDate===$date){
				$sql = "delete from TaskTimeline where taskID='$taskID' and taskName='$taskName'";
			}else{
				$sql = "update TaskTimeline set endDate='$date' where taskID='$taskID' and taskName='$taskName'";
			}

			$query = $mysqli->query($sql);

			if($query){
				
			}else{
				$result = array();
				$result['success'] = -2;
				echo json_encode($result);
				exit();
			}
			
		}else{
			echo $mysqli->error;
			$result = array();
			$result['success'] = -3;
			echo json_encode($result);
			exit();
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