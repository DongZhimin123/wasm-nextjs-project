import { parentPort } from "worker_threads";
import path from "path";
import { build_tree } from "../wasm_pkg/tree_wasm_node.js"; // Node target 直接导入

// 接收主线程消息
parentPort?.on("message", (logs: string[]) => {
    try {
        // Node target wasm 直接调用 build_tree
        const tree: any[] = build_tree(logs);
        parentPort?.postMessage(tree);
    } catch (err) {
        parentPort?.postMessage({ error: (err as Error).message });
    }
});