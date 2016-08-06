var simple2d = require("./simple2dmodule.js")
var _ = require("lodash")

var PEEL = { version:0.1 }

// some constants
// arctan(1/2) = 0.4367609 rad
// pi/5 = 0.62831853071
// pi/2 = 1.57079632679
PEEL.ATH = 0.463647609
PEEL.POF = 0.62831853071
PEEL.POT = 1.57079632679

// Spherical coordinates for icosahedron, without radius
// [inclination, azimuth] origin vector [1,0,0] (x,y,z)
PEEL.ICO_VERTS = [	[PEEL.POT,0],
					[PEEL.ATH,0],
					[PEEL.ATH,2*PEEL.POF],
					[PEEL.ATH,4*PEEL.POF],
					[PEEL.ATH,6*PEEL.POF],
					[PEEL.ATH,8*PEEL.POF],
					[-PEEL.ATH,PEEL.POF],
					[-PEEL.ATH,3*PEEL.POF],
					[-PEEL.ATH,5*PEEL.POF],
					[-PEEL.ATH,7*PEEL.POF],
					[-PEEL.ATH,9*PEEL.POF],
					[PEEL.ATH,0] 	
				]

// Counterclockwise normal
PEEL.ICO_FACES = [	[0,1,2],
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

PEEL.Radius = function(inclination){
	// Should put in a fancier function, to deal with intersection of bezier... for later!
	return 5
}

// generate half-edge graph
// getEdge(v1,v2) = {f1, f2, next, prev, length, v1_2d, v2_2d } --> next = v3, prev = v3
/*	   v4
	   /\ 
	  /  \
	 / f2 \
	v2----v1
	 \ f1 /
      \	 /
       \/
       v3
*/

PEEL.State = {
	// Main storage object for this project
	// initialise data
	edgeGraph:null,
	verts3d:null,
	faces:null,
	verts2D:null,
	// set up data
	graphFromVertsAndFaces :function(verts, faces){
		// reset stuff
		this.edgeGraph = {};
		this.verts3d = verts;
		this.faces = faces;

		//
		for(var i = 0; i < faces.length; i++){
		var face = faces[i];
		for(var j = 0; j < face.length; j++){
			var edge = [face[j].toString(),face[(j+1)%face.length].toString()];
			if(!(edge[0] in this.edgeGraph)){
				this.edgeGraph[edge[0]] = {};
			}
			var prev = j-1 >= 0? face[j-1]:face[face.length-1];
			var next = j+2 < face.length? face[j+2]:face[(j+2)%face.length];
			this.edgeGraph[edge[0]][edge[1]] = {face:i, next:next, prev:prev, connected:false};

			}
		}
	},
	getEdge :function(v1, v2){
		me = this;
		v1_s  = v1.toString();
		v2_s  = v2.toString();
		return {
			v1:v1,
			v2:v2,
			f1:me.edgeGraph[v1_s][v2_s].face,
			f2:me.edgeGraph[v2_s][v1_s].face,
			connected:me.edgeGraph[v1_s][v2_s].connected,
			next:function(){
				return me.getEdge(v2,me.edgeGraph[v1_s][v2_s].next)
			},
			previous:function(){
				return me.getEdge(me.edgeGraph[v1_s][v2_s].prev,v1)
			},
			opposite:function(){
				return me.getEdge(v2,v1)
			},
			equals:function(edge){
				return edge.f1 == this.f1 && edge.f2 == this.f2
			}
		}
	},
	randomlyConnect:function(){
		me = this;
		// Assign random weights
		var disconnectedFaces = []
		var connectedFaces = []
		for(v1 in this.edgeGraph){
			for(v2 in this.edgeGraph[v1]){
				this.edgeGraph[v1][v2].weight = Math.random();
				this.edgeGraph[v2][v1].weight = this.edgeGraph[v1][v2].weight;
				if(!_.contains(disconnectedFaces, this.edgeGraph[v1][v2].face)){
					disconnectedFaces.push(this.edgeGraph[v1][v2].face)
				}
			}
		}

		//Prims algorithm for finding a min spanning tree
		connectedFaces.push(disconnectedFaces.pop())
		while(disconnectedFaces.length > 0){
			var bestEdgeIDs = undefined;
			var bestEdge = undefined;
			var minEdgeWeigth = 1;
			_.forEach(connectedFaces,function(faceID){
				_.forEach(PEEL.faceToEdges(faceID),function(edgeIDs){
					var edge = me.getEdge(edgeIDs[0],edgeIDs[1]);
					if(!edge.connected && (_.contains(disconnectedFaces, edge.f1) || _.contains(disconnectedFaces, edge.f2))){
						var w = me.edgeGraph[edgeIDs[0]][edgeIDs[1]].weight;
						if(w < minEdgeWeigth){
							bestEdgeIDs = edgeIDs;
							bestEdge = edge;
							minEdgeWeigth = w
						}
					}
				})
			})
			if(bestEdge != undefined){
				me.edgeGraph[bestEdgeIDs[0]][bestEdgeIDs[1]].connected = true;
				me.edgeGraph[bestEdgeIDs[1]][bestEdgeIDs[0]].connected = true;
			}
			if(_.contains(disconnectedFaces, bestEdge.f1)){

				_.pull(disconnectedFaces, bestEdge.f1);
				if(!_.contains(connectedFaces,bestEdge.f1)){
					connectedFaces.push(bestEdge.f1)
				}
			}
			if(_.contains(disconnectedFaces, bestEdge.f2)){
				_.pull(disconnectedFaces, bestEdge.f2);
				if(!_.contains(connectedFaces,bestEdge.f2)){
					connectedFaces.push(bestEdge.f2)
				}
			}
		}
	},
	initBox2DVertices:function(){
		//
		this.verts2D = {};


	},
	recursive2DHelper:function(){

	}
	,
	edgeList:function(){
		var edgelist = [];
		for (v1 in this.edgeGraph){
			for(v2 in this.edgeGraph[v1]){
				if (!(_.contains(edgelist, [v1,v2]) || _.contains(edgelist, [v2,v1]))){
					edgelist.push([v1,v2]);
				}
			}
		}
		return edgelist
	},
	edgeLengths2Verts:function(l1,l2,l3,v1,v2){
		// returns the third vertex to make a triangle with edge lengths l1,l2,l3
		// 				v2--l1--v1
		//				 \      /
		//               l2    l3
		//                 \  /
		//                  v3

		var theta = Math.acos(l1/(2*l3) + l3/(2*l1) - l2*l2/(2*l1*l3));
		var scale = v1.distance(v2)/l1;
		var sl1 = l1*scale, 
			sl2 = l2*scale, 
			sl3 = l3*scale;
		return v1.add(simple2d.rotate(theta).mult(v2.sub(v1).normalise().mult(sl3)))
	}


}


PEEL.verts = PEEL.ICO_VERTS;
PEEL.faces = PEEL.ICO_FACES;
PEEL.faceToEdges = function(faceID){
	var edges = [];
	var face = PEEL.faces[faceID]
	for(var i = 0; i<face.length; i++){
		edges.push([face[i], face[(i+1)%face.length]])
	}
	return edges
}

PEEL.State.graphFromVertsAndFaces(PEEL.verts, PEEL.faces);
PEEL.State.randomlyConnect();
console.log(PEEL.State.edgeList())


Verts2D = {
	hey:0,
	newVert:function(x,y){
		this[this.hey.toString()] = [x,y];
		var temp = this.hey.toString();
		this.hey += 1;
		return temp
	}
}

console.log(PEEL.State.edgeLengths2Verts(5,3,4,new simple2d.Point(4,0), new simple2d.Point(0,3)))
console.log(PEEL.State.edgeLengths2Verts(3,4,5,new simple2d.Point(0,3), new simple2d.Point(0,0)))
console.log(PEEL.State.edgeLengths2Verts(4,5,3,new simple2d.Point(0,0), new simple2d.Point(4,0)))