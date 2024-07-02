<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers:x-requested-with, content-type');

//DB Config
$servername = "";
$username = "";
$password = "";
$dbname = "";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['code'=>1,'data'=>[],'msg'=>"DB Error: ".$e->getMessage()]);
    die();
}

//插入或拉取祝福
$action = $_POST['action'];

if($action == 'insert'){
    $bless = $_POST['bless'];
    $ip = get_real_ip();
    $state = 0;
    $created_at = date('Y-m-d H:i:s',time());
    $sql = "INSERT INTO propose_bless (bless, ip, state, created_at) VALUES ('".$bless."', '".$ip."', ".$state.", '".$created_at."')";
    $conn->exec($sql);
    echo json_encode(['code'=>1,'data'=>[],'msg'=>'添加成功']);
}elseif ($action == 'get_bless'){
    $sql = "SELECT bless FROM propose_bless WHERE state = 1 LIMIT 200";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    //设置结果集为关联数组
    $data = [];
    $result = new RecursiveArrayIterator($stmt->fetchAll(PDO::FETCH_ASSOC));
    foreach ($result as $k => $v){
        $data[] = $v['bless'];
    }
    echo json_encode(['code'=>1,'data'=>$data,'msg'=>'获取成功']);
}else{
    echo json_encode(['code'=>0,'data'=>[],'msg'=>'非法操作']);
}


$conn = null;

function get_real_ip(){
    $ip=FALSE;
    //客户端IP 或 NONE
    if(!empty($_SERVER["HTTP_CLIENT_IP"])){
        $ip = $_SERVER["HTTP_CLIENT_IP"];
    }
    //多重代理服务器下的客户端真实IP地址（可能伪造）,如果没有使用代理，此字段为空
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ips = explode (", ", $_SERVER['HTTP_X_FORWARDED_FOR']);
        if ($ip) { array_unshift($ips, $ip); $ip = FALSE; }
        for ($i = 0; $i < count($ips); $i++) {
            if (!eregi ("^(10│172.16│192.168).", $ips[$i])) {
                $ip = $ips[$i];
                break;
            }
        }
    }
    //客户端IP 或 (最后一个)代理服务器 IP
    return ($ip ? $ip : $_SERVER['REMOTE_ADDR']);
}

die();
?>
