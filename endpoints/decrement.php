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
    date_default_timezone_set("Europe/London");
	$sql = "select * from Tasks where userID='$userID'";
	$query = $mysqli->query($sql);

	if($query){
		// Sweet
		
		$row = $query->fetch_assoc();
		$id = $row['id'];
		$json_tasks = $row['tasks'];
		$tasks = json_decode($json_tasks,true);
		$tasks[$taskIndex]['number'] -= 1;
		$json_tasks = json_encode($tasks);
		$sql = "update Tasks set tasks='$json_tasks' where id='$id'";
		$query = $mysqli->query($sql);
		if ($query){
			$result = array();
			$result['success'] = 1;
			echo json_encode($result);
			exit();
		}else{
			echo '3';
			exit();
		}
	
	}else{
		//echo "Error: " . $sql . "<br>" . $mysqli->error;
		echo '4';
		exit();
	}
?>