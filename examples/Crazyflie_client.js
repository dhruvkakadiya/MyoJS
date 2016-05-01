require('./../build/myojs.min');
var zmq = require('zmq'), sock = zmq.socket('push');
var bind_addr = "tcp://127.0.0.1:1212";
sock.connect(bind_addr);
//context = zmq.Context();
//sender = context.socket(zmq.PUSH);
//bind_addr = "tcp://127.0.0.1:{}".format(1024 + 188);
//sender.connect(bind_addr);

var cmdmess = {
    "version": 1,
    "ctrl": {
        "roll": 0.0,
        "pitch": 0.0,
        "yaw": 0.0,
        "thrust": 30
    }
};

console.log("starting to send control commands!");

// Unlocking thrust protection
cmdmess["ctrl"]["thrust"] = 0;
sock.send(JSON.stringify(cmdmess));

var hub = Myo.Hub(),
    checkConnection;

var quat_roll = 0;
var quat_pitch = 0;
var quat_yaw = 0;
var pose_type;
hub.on('ready', () => { console.log('ready'); });
hub.on('connect', () => { console.log('connected'); });
hub.on('disconnect', () => { console.log('disconnect'); });
hub.on('frame', (frame) => {
    //console.log(frame.rotation.toString());
    //console.log(frame.accel.toString());
    //console.log(frame.gyro.toString());
    quat_pitch = frame.rotation.pitch();
    quat_roll = frame.rotation.roll();
    quat_yaw = frame.rotation.yaw();
    //pose_type = frame.pose;
    //console.log("Pitch: "+quat_pitch);
    //console.log("Roll: "+quat_roll);
    //console.log("Yaw: "+quat_yaw);
    if(frame.pose.toString() != "[Pose invalid]")
    {
    	pose_type = frame.pose;//.toString();
    	console.log("Pose:"+pose_type.type);

    	// Send commands to Crazyflie based on different gestures
	   if (pose_type.type == 1)
	   {
	   	cmdmess["ctrl"]["thrust"] = (5500 ) / 100.0;
	   	console.log("Double Tap Detected!");
	   }   
	   else if (pose_type.type == 3)
	   {
	   	cmdmess["ctrl"]["thrust"] = ( 7500 ) / 100.0;
	   	console.log("WAVE IN Detected!");
	   }
	   else
	   {
	   	cmdmess["ctrl"]["thrust"] = 0;
	   	//console.log("Rest Detected!");
	   }
	   sock.send(JSON.stringify(cmdmess));
    }
});

checkConnection = setInterval(() => {
    if(hub.connection.connected) {
        clearInterval(checkConnection);
    } else {
        console.log('Waiting for connection...');
    }
}, 1000);