class FSNode {
  children: FSNode[];
  name: string;
  aliasTarget?: FSNode;

  constructor(name: string, aliasTarget?: FSNode) {
    this.name = name;
    this.children = [];
    this.aliasTarget = aliasTarget;
  }

  addChild(child: FSNode): void {
    this.children.push(child);
  }

  addAlias(name: string, target: FSNode): void {
    const alias = new FSNode(name, target);
    this.children.push(alias);
  }
}

function findPath(
  node: FSNode,
  target: FSNode,
  path: FSNode[] = []
): FSNode[] | null {
  if (node === target) {
    return [...path, node];
  }
  for (const child of node.children) {
    const result = findPath(child, target, [...path, node]);
    if (result != null) {
      return result;
    }
  }
  return null;
}

function findCommonAncestor(
  root: FSNode,
  node1: FSNode,
  node2: FSNode
): FSNode | null {
  const path1 = findPath(root, node1);
  const path2 = findPath(root, node2);

  if (path1 == null || path2 == null) {
    return null;
  }

  let commonAncestor = null;
  for (let i = 0; i < Math.min(path1.length, path2.length); i++) {
    if (path1[i] === path2[i]) {
      commonAncestor = path1[i];
    } else {
      break;
    }
  }
  return commonAncestor;
}

// Creating the filesystem structure and adding test cases
const root = new FSNode("root");
const folder1 = new FSNode("folder1");
const folder2 = new FSNode("folder2");
const file1 = new FSNode("file1");
const file2 = new FSNode("file2");
const folder3 = new FSNode("folder3");
const deepFolder = new FSNode("deepFolder");
const deepFile1 = new FSNode("deepFile1");
const deepFile2 = new FSNode("deepFile2");

root.addChild(folder1);
root.addChild(folder2);
root.addChild(folder3);

folder1.addChild(file1);
folder2.addChild(file2);
folder3.addChild(deepFolder);
deepFolder.addChild(deepFile1);
deepFolder.addChild(deepFile2);

folder1.addAlias("aliasToFolder2", folder2);
folder2.addAlias("aliasToFolder3", folder3);
folder1.addAlias("aliasToDeepFile1", deepFile1);

/**
 * root
 ├── folder1
 │    ├── file1
 │    ├── aliasToFolder2 -> folder2
 │    └── aliasToDeepFile1 -> deepFile1
 ├── folder2
 │    ├── file2
 │    └── aliasToFolder3 -> folder3
 └── folder3
      └── deepFolder
           ├── deepFile1
           └── deepFile2
 */

// Test cases to verify the functionality with aliases
const aliasToFolder2 = folder1.children.find(
  (child) => child.name === "aliasToFolder2"
)!;
const aliasToFolder3 = folder2.children.find(
  (child) => child.name === "aliasToFolder3"
)!;

// Expcted: "root"
console.log(findCommonAncestor(root, file1, aliasToFolder2.aliasTarget!)?.name);

// Extected: "folder2"
console.log(
  findCommonAncestor(root, aliasToFolder2?.aliasTarget!, file2)?.name
);

// Test Case 1: Common ancestor between two files under the same folder (folder1)
// Expected: "root"
console.log(
  findCommonAncestor(
    root,
    file1,
    folder1.children.find((child) => child.name === "aliasToDeepFile1")
      ?.aliasTarget!
  )?.name
);

// Test Case 2: Common ancestor between a file and another file accessed via an alias
// Expected: "root"
console.log(
  findCommonAncestor(
    root,
    file2,
    folder2.children.find((child) => child.name === "aliasToFolder3")
      ?.aliasTarget!
  )?.name
);

// Test Case 3: Common ancestor between two aliases pointing to different folders
// Expected: "root"
console.log(
  findCommonAncestor(
    root,
    aliasToFolder2?.aliasTarget!,
    aliasToFolder3?.aliasTarget!
  )?.name
);

// Test Case 4: Common ancestor between two files in a deeply nested structure
// Expected: "deepFolder"
console.log(findCommonAncestor(root, deepFile1, deepFile2)?.name);
