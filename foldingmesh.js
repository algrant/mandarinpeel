var geodesic = require("./geodesicmesh.js");

var THREE = require("three");

var foldingmesh = function(args){
	this.originalVerts3D = args.verts3D;
	this.originalFaces3D = args.faces;
	this.squishy = "squishy" in args? args.squishy : false;
}

foldingmesh.prototype.initEdgeGraph = function(){
	
	// create the halfEdgeGraph
	this.halfEdgeGraph = {};
	var faces = this.originalFaces3D;
	var verts = this.originalVerts3D;

	// Fill with data!
	for(var i = 0; i < faces.length; i++){
		var face = faces[i];
		for(var j = 0; j < face.length; j++){
			var edge = [face[j],face[(j+1)%face.length]];
			if(!(edge[0].toString() in this.halfEdgeGraph)){
				this.halfEdgeGraph[edge[0]] = {};
			}
			var prev = j-1 >= 0? face[j-1]:face[face.length-1];
			var next = j+2 < face.length? face[j+2]:face[(j+2)%face.length];

			this.halfEdgeGraph[edge[0]][edge[1]] = {face:i, 
												next:next, 
												prev:prev, 
												connected:false, 
												length:"TODO", 
												v1_2d:"TODO", 
												v2_2d:"TODO",
												v1_3d:edge[0],
												v2_3d:edge[1],
												openAngle:"TODO",
												opened:"TODO"};
		}
	}

	// Create Spanning Tree
	// Random Weights
	for(v1_3d in this.halfEdgeGraph){
		for(v2_3d in this.halfEdgeGraph[v1_3d]){
			this.halfEdgeGraph[v1_3d][v2_3d].weight = Math.random();
			this.halfEdgeGraph[v2_3d][v1_3d].weight = this.halfEdgeGraph[v1_3d][v2_3d].weight;
		}
	}

	// Create a random min spanning tree
	// silly range function http://stackoverflow.com/questions/3895478/does-javascript-have-a-range-equivalent
	var disconnectedFaces = Array.apply(null, Array(this.originalFaces3D.length)).map(function (_, i) {return i;});
	var connectedFaces = [];
	var potentialEdges = [];

	//Create THREE.js Geometry for 2D and 3D versions, 
}

var a = new foldingmesh({verts3D:geodesic.verts,faces:geodesic.faces});
a.initEdgeGraph();
console.log(a)