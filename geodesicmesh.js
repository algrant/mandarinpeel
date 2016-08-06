
// some constants
// arctan(1/2) = 0.4367609 rad
// pi/5 = 0.62831853071
// pi/2 = 1.57079632679

var ATH = 0.463647609;
var POF = 0.62831853071;
var POT = 1.57079632679;

// spherical coordinates
var ICO_VERTS = [	[0,0],
					[POT-ATH,0],
					[POT-ATH,2*POF],
					[POT-ATH,4*POF],
					[POT-ATH,6*POF],
					[POT-ATH,8*POF],
					[POT+ATH,POF],
					[POT+ATH,3*POF],
					[POT+ATH,5*POF],
					[POT+ATH,7*POF],
					[POT+ATH,9*POF],
					[2*POT,0] 	
				]

// Counterclockwise normal
var ICO_FACES = [	[0,1,2],
					[0,2,3],
					[0,3,4],
					[0,4,5],
					[0,5,1],
					[1,6,2],
					[2,7,3],
					[3,8,4],
					[4,9,5],
					[5,10,1],
					[6,7,2],
					[7,8,3],
					[8,9,4],
					[9,10,5],
					[10,6,1],
					[6,11,7],
					[7,11,8],
					[8,11,9],
					[9,11,10],
					[10,11,6]
				];

var radiusFunction = function(inclination, azimuth){
	return 5;
}

var sphericalCoordsRadius = function(args){
	var verts = args.verts;
	var faces = args.faces;
	var radfunction = args.radfunction;
	var newVerts = []

	for(var i = 0; i < verts.length; i++){
		var inclination = verts[i][0]
		var azimuth = verts[i][1]
		var radius = radfunction(inclination,azimuth);
		newVerts.push([radius*Math.sin(inclination)*Math.cos(azimuth),radius*Math.sin(inclination)*Math.sin(azimuth),radius*Math.cos(inclination)])
	}

	return {faces:faces, verts:newVerts}
}

module.exports = sphericalCoordsRadius({faces: ICO_FACES, verts:ICO_VERTS, radfunction:radiusFunction})