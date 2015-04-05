<?php
	$servername = "localhost";
	$serverusername = "root";
	$serverpassword = "";
	$db = "habyte";

	$mysqli = new mysqli($servername, $serverusername, $serverpassword, $db);

    if ($mysqli->connect_errno) {
        printf("Connect failed: %s\n", $mysqli->connect_error);
        echo '[]';
        exit();
    }
	$sql = "select * from Tasks";
	$query = $mysqli->query($sql);

	if($query){
		$num_rows = $query->num_rows;
		if($num_rows > 0){
			$row = $query->fetch_assoc();
			echo $row['tasks'];
		}
		else{
			echo '[]';
		}
	}else{
		echo '[]';
	}

?>