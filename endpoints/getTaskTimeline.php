<?php

	$userID = $_GET['userUID'];
	include 'db.php';

	$mysqli = new mysqli($servername, $serverusername, $serverpassword, $db);

    if ($mysqli->connect_errno) {
        printf("Connect failed: %s\n", $mysqli->connect_error);
        echo '[]';
        exit();
    }

	// $diff = $date2->diff($date1)->format("%a");

	$sql = "select * from Tasks where userID='$userID'";
	$query = $mysqli->query($sql);

	if($query){
		$row = $query->fetch_assoc();
		$taskID=$row['id'];

		$sql = "select * from TaskTimeline where taskID='$taskID'";
		$query = $mysqli->query($sql);
		if($query){
			$rows = array();
			while($row = $query->fetch_assoc()){
				$rows[] = $row;
			};

			echo json_encode($rows);

		}else{
			echo '[]';
		}
		
	}else{
		echo '[]';
	}

?>