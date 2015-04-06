<?php

	$userID = $_GET['userUID'];
	include 'db.php';

	$mysqli = new mysqli($servername, $serverusername, $serverpassword, $db);

    if ($mysqli->connect_errno) {
        printf("Connect failed: %s\n", $mysqli->connect_error);
        echo '[]';
        exit();
    }
    $date = date("Y-m-d");
    $dateNow = new DateTime($date);

	// $diff = $date2->diff($date1)->format("%a");

	$sql = "select * from Tasks where userID='$userID'";
	$query = $mysqli->query($sql);

	if($query){
		$num_rows = $query->num_rows;
		if($num_rows > 0){
			$row = $query->fetch_assoc();
			$tasks = json_decode($row['tasks'],true);
			$dateBefore = new DateTime($row['date']);

			$diff = intval($dateNow->diff($dateBefore)->format("%a"));

			$taskID=$row['id'];

			if($diff===0){
				echo json_encode($tasks);
			}else{
				$oldTasks = $tasks;
				for($i = 0; $i < count($tasks); $i++){
					$number = $tasks[$i]['number'];
					$tasks[$i]['number'] = 0;
					//$taskID = $i;
					$taskName = $tasks[$i]['name'];

					$sql = "select * from TaskTimeline where taskID='$taskID' and taskName='$taskName'";
					$query = $mysqli->query($sql);

					if($query){
						$row = $query->fetch_assoc();
						$timeline = json_decode($row['timeline'],true);
						$timeline[] = $number;
						for($j = 0; $j < $diff - 1; $j++){
							$timeline[] = 0;
						}
						$j_timeline = json_encode($timeline);
						$sql = "update TaskTimeline set timeline='$j_timeline' where taskID='$taskID' and taskName='$taskName'";
						$query = $mysqli->query($sql);
						if($query){

						}else{
							exit();
						}
					}else{
						exit();
					}

				}
				$tasks = json_encode($tasks);

				$sql = "update Tasks set date='$date' where id='$taskID'";

				$query = $mysqli->query($sql);
				if($query){
					$sql = "update Tasks set tasks='$tasks' where id='$taskID'";
					$query = $mysqli->query($sql);
					if($query){

					}else{
						exit();
					}

				}else{
					exit();
				}

				echo $tasks;

			}
		}
		else{
			echo '[]';
		}
	}else{
		echo '[]';
	}

?>