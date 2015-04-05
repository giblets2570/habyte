<?php
	$postdata = file_get_contents("php://input");
	$request = json_decode($postdata);

	$username = $request->username;
	$password = $request->password;
	
	$servername = "localhost";
	$serverusername = "root";
	$serverpassword = "";
	$db = "habyte";

	$mysqli = new mysqli($servername, $serverusername, $serverpassword, $db);

    if ($mysqli->connect_errno) {
        printf("Connect failed: %s\n", $mysqli->connect_error);
        exit();
    }

	$sql = "select * from Users where name='$username'";
	$query = $mysqli->query($sql);

	if($query){
		// Sweet
		$numrows = $query->num_rows;
		if($numrows === 0){
			$sql = "insert into Users(id,name,password) values (NULL,'$username','$password')";
			$query = $mysqli->query($sql);

			if($query){
				$sql = "select * from Users where name='$username'";
				$query = $mysqli->query($sql);
				$row = $query->fetch_assoc();
				$results = array();
				$results['uid'] = $row['id'];
				echo json_encode($results);
				exit();
			}
		}
	}
	$results = array();
	$results['uid'] = -1;
	echo json_encode($results);
	exit();
?>