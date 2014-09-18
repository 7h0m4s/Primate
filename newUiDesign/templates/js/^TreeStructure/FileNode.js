// class Node

function FileNode(nodeName, parent, childNodes, childLeaves) {
    this.nodeName = nodeName;
    this.parent = parent;
    this.childNodes = childNodes;
    this.childLeaves = childLeaves;


}
var traverse = function (obj) {
    console.log("fileNode name: " + obj.nodeName );
    for (var a in obj.childLeaves) {
        console.log("fileNode name: " + obj.childLeaves[a].nodeName);
    }
    for (var b in obj.childNodes) {
        traverse(obj.childNodes[b]);
    }
};


var employee = new FileNode("employee", datacenter, null, null);
var worker = new FileNode("worker", datacenter, null, null);
var datacenterInstance = new FileNode("datacenertInstance", datacenter, null, null);
var datacenter = new FileNode("Datacenter", root, [employee, worker], [datacenterInstance]);
var serverInstance = new FileNode("serverInstance", datacenter, null, null);

var server = new FileNode("server", root, null, [serverInstance]);

var rootChildNodes = [datacenter, server];
var rootChildLeaves = [new FileNode("rootInstance1", root, null, null),
                      new FileNode("rootInstance2", root, null, null),
                      new FileNode("rootInstance3", root, null, null)
];

var root = new FileNode("root", null, rootChildNodes, rootChildLeaves);
traverse(root);
