"use client";

import {useEffect, useState} from "react";
import init, {build_tree, N0de} from "@wasm/tree_wasm";

export function buildTree(logs: Array<string | Record<string, any>>): N0de[] {
    const nodes: Record<string, N0de> = {};

    // 1. 先解析日志并初始化节点
    for (const log of logs) {
        const parsed = typeof log === "string" ? JSON.parse(log) : log;
        nodes[parsed.id] = { ...parsed, children: [] };
    }

    // 2. 建立父子关系
    const tree: N0de[] = [];
    for (const node of Object.values(nodes)) {
        if (node.parent_id && nodes[node.parent_id]) {
            nodes[node.parent_id].children.push(node);
        } else {
            tree.push(node);
        }
    }

    return tree;
}

export default function Home() {

    const [tree, setTree] = useState<N0de[]>([]);


    useEffect(() => {
        (async () => {
            await init();

            const jsonArray: string[] = Array.from({ length: 1000000 }, (_, i) =>
                JSON.stringify({
                    id: `${i + 1}`,
                    parent_id: i === 0 ? null : "1",
                    latest_timestamp: new Date().toISOString(),
                    latest_author: "User" + (i % 10),
                })
            );

            console.time("build_tree");
            setTree(build_tree(jsonArray));
            console.timeEnd("build_tree");
            console.time("buildTree");
            setTree(buildTree(jsonArray));
            console.timeEnd("buildTree");
        })();
    }, []);

    // 递归渲染树
    const renderNode = (node: N0de) => (
        <li key={node.id}>
            <div>
                {node.id} - {node.latest_author} - {node.latest_timestamp}
            </div>
            {node.children.length > 0 && (
                <ul>
                    {node.children.map((child) => renderNode(child))}
                </ul>
            )}
        </li>
    );

    return (
        <>
            <h1>日志树</h1>
            {tree.length > 0 ? <ul>{tree.map(renderNode)}</ul> : <p>Loading...</p>}
        </>
    );
}

// export default function Home() {
//
//     const [tree, setTree] = useState<N0de[]>([]);
//
//     useEffect(() => {
//         const logs = Array.from({ length: 100000 }, (_, i) =>
//             JSON.stringify({
//                 id: `${i + 1}`,
//                 parent_id: i === 0 ? undefined : "1",
//                 latest_timestamp: new Date().toISOString(),
//                 latest_author: `User${i % 10}`,
//             })
//         );
//
//         fetch("/api/tree", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(logs),
//         })
//             .then(res => res.json())
//             .then((data: N0de[]) => {
//                 setTree(data);
//             });
//     }, []);
//
//     // 递归渲染树
//     const renderNode = (node: N0de) => (
//         <li key={node.id}>
//             <div>
//                 {node.id} - {node.latest_author} - {node.latest_timestamp}
//             </div>
//             {node.children.length > 0 && (
//                 <ul>
//                     {node.children.map((child) => renderNode(child))}
//                 </ul>
//             )}
//         </li>
//     );
//
//     return (
//         <>
//             <h1>日志树</h1>
//             {tree.length > 0 ? <ul>{tree.map(renderNode)}</ul> : <p>Loading...</p>}
//         </>
//     );
// }