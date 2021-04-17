
const mqttHost = 'm23.cloudmqtt.com';
const mqttPort = 31711;
const mqttUsername = 'aizzyznu';
const mqttPassword = 'f2Eyph2tS889';
let mqttID = "MQTT-"+Math.random().toString(36).substring(7);
var mqtt;

console.log('MQTT ID:', mqttID);




//const host = 'wss://m23.cloudmqtt.com:31711'

const options = {
  keepalive: 30,
  clientId: mqttID,
  protocolId: 'MQTT',
  protocolVersion: 4,
  clean: true,
  ssl: true,
  username: 'aizzyznu',
  password: 'f2Eyph2tS889',
  reconnectPeriod: 2000,
  connectTimeout: 30 * 1000,
  
  rejectUnauthorized: false
}

console.log('connecting MQTT client');


const client = mqtt.connect('wss://'+mqttHost+':'+mqttPort, options);

client.on('error', (err) => {
  console.log('Connection error: ', err);
  client.end();
  document.getElementById("mqtt_status").innerHTML = 'Cloud Not Connected';
  document.getElementById("mqtt_status").style.color="red";
});

client.on('reconnect', () => {
  console.log('Reconnecting...');
});

client.on('connect', () => {
  console.log('Client connected:' + mqttID);
  client.subscribe('OUT/+', { qos: 0 });
  //client.publish('testtopic', 'ws connection demo...!', { qos: 0, retain: false })
  
  document.getElementById("mqtt_status").innerHTML = 'Cloud Connected';
  document.getElementById("mqtt_status").style.color="green";
});

client.on('message', (topic, message, packet) => {
  //console.log('Received Message: ' , message, '\nOn topic: ' + topic);
	if(message.length==8){
		if(message[0]==="A".charCodeAt(0)){
			let percentage = message[1]*256+message[2];
			if(percentage>=0 && percentage<=100){
			  
				console.log('Received percentage: ',percentage);
			  
				var series = pen.series[0];
   
				var x = (new Date()).getTime(), // current time
				y = percentage;
				series.addPoint([x, y], true, true);
			}
		  
		}
	}
});

client.on('close', () => {
  console.log(mqttID + ' disconnected');
});


var pen;
var chart = {
	type: 'spline',
	animation: Highcharts.svg, // don't animate in IE < IE 10.
	marginRight: 10,
	events: {
		load: function () {
			pen = this;
		}
	}
};

var seriesData= [{
      name: 'Random data',
      data: (function () {
         // generate an array of random data
         var data = [],time = (new Date()).getTime(),i;
         for (i = -10; i <= 0; i += 1) {
            data.push({
               x: time + i * 1000,
               y: Math.random()*100
            });
         }
         return data;
      }())    
   }];     

$(document).ready(function() {
   


   var title = {
      text: 'Live moisture data'
   };
   var subtitle = {
      text: 'Source: askq.co.nz'
   };
   var xAxis = {
      type: 'datetime',
      tickPixelInterval: 150
   };
   var yAxis = {
      title: {
         text: 'Percentage ( % )'
      },
      plotLines: [{
         value: 0,
         width: 1,
         color: '#808080'
      }]
   };
   var tooltip = {
      formatter: function () {
      return '<b>' + seriesData.name + '</b><br/>' +
         Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
         Highcharts.numberFormat(this.y, 2);
      }
   };
   var plotOptions = {
      area: {
         pointStart: 1940,
         marker: {
            enabled: false,
            symbol: 'circle',
            radius: 2,
            states: {
               hover: {
                 enabled: true
               }
            }
         }
      }
	};
	var legend = {
		enabled: false
	};
	var exporting = {
		enabled: false
	};
   
      
	var json = {};   
	json.chart = chart; 
	json.title = title;   
	json.subtitle = subtitle;   
	json.tooltip = tooltip;
	json.xAxis = xAxis;
	json.yAxis = yAxis; 
	json.legend = legend;  
	json.exporting = exporting;   
	json.series = seriesData;
	json.plotOptions = plotOptions;
   
   
	Highcharts.setOptions({
		global: {
			useUTC: false
		}
	});
	$('#container').highcharts(json);
});
/*
setInterval(function(){ 
	
	var series = pen.series[0];
   
	var x = (new Date()).getTime(), // current time
	y = Math.random()*100;
	series.addPoint([x, y], true, true);
}, 1000);
*/
