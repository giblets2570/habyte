<?php
	$postdata = file_get_contents("php://input");
	$request = json_decode($postdata);
	$userID = $request->userUID;
	$task = $request->task;

	$servername = "localhost";
	$serverusername = "root";
	$serverpassword = "";
	$db = "habyte";

	$mysqli = new mysqli($servername, $serverusername, $serverpassword, $db);

    if ($mysqli->connect_errno) {
        printf("Connect failed: %s\n", $mysqli->connect_error);
        echo '1';
        exit();
    }

	$sql = "select * from Tasks where userID='$userID'";
	$query = $mysqli->query($sql);

	if( $query){
		// Sweet
		$numrows = $query->num_rows;

		if($numrows === 0){
			$tasks = array();
			$tasks[] = $task;
			$json_task = json_encode($tasks);
			$sql = "insert into Tasks(id,userID,tasks) values (NULL,'$userID','$json_task')";
			$query = $mysqli->query($sql);
			if ($query){
				//pass
			}else{
				echo '2';
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
			}else{
				echo '3';
				exit();
			}
		}
	}else{
		//echo "Error: " . $sql . "<br>" . $mysqli->error;
		echo '4';
		exit();
	}

	$sql = "select * from Tasks where userID='$userID'";
	$query = $mysqli->query($sql);
	if ($query){
		$row = $query->fetch_assoc();
		$id = $row['id'];
		$result = array();
		$result['headers'] = $id;
		echo json_encode($result);
	}else{
		echo '5';
		exit();	
	}

?>