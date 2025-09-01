import { NextRequest, NextResponse } from "next/server";
import { Worker } from "worker_threads";
import path from "path";

export async function POST(req: NextRequest) {
    const logs = await req.json(); // 获取客户端日志数组

    return new Promise((resolve) => {
        const worker = new Worker(path.resolve("./src/workers/tree.worker.ts"));

        worker.on("message", (tree) => {
            resolve(NextResponse.json(tree));
            worker.terminate();
        });

        worker.postMessage(logs);
    });
}