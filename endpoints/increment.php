<?php
	$postdata = file_get_contents("php://input");
	$request = json_decode($postdata);

	$taskIndex = $request->taskIndex;

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

	$sql = "select * from Tasks";
	$query = $mysqli->query($sql);

	if($query){
		// Sweet
		
		$row = $query->fetch_assoc();
		$id = $row['id'];
		$json_tasks = $row['tasks'];
		$tasks = json_decode($json_tasks);
		echo($tasks[$taskIndex]);
		$tasks[$taskIndex]['number'] = $tasks[$taskIndex]['number'] + 1;
		$json_tasks = json_encode($tasks);
		// echo("$json_tasks");
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