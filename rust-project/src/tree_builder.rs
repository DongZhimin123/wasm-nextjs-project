use serde_json::Value;
use serde_wasm_bindgen::{from_value, to_value};
use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct N0de {
    pub id: String,
    pub parent_id: Option<String>,
    pub children: Vec<N0de>,
    pub latest_timestamp: Option<String>,
    pub latest_author: Option<String>,
}

#[wasm_bindgen]
pub fn build_tree(json: JsValue) -> JsValue {
    // 解析 JSON
    let logs: Vec<String> = from_value(json).unwrap();
    let mut node_map: HashMap<String, N0de> = HashMap::with_capacity(logs.len());

    // 1️⃣ 构建节点并索引
    for log in logs {
        if let Ok(v) = serde_json::from_str::<Value>(&log) {
            let id = v
                .get("id")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            let parent_id = v
                .get("parentId")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());
            let timestamp = v
                .get("timestamp")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());
            let author = v
                .get("author")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());

            let node = node_map.entry(id.clone()).or_insert(N0de {
                id: id.clone(),
                parent_id: parent_id.clone(),
                children: Vec::new(),
                latest_timestamp: timestamp.clone(),
                latest_author: author.clone(),
            });

            if let Some(ts) = timestamp {
                if node.latest_timestamp.as_ref().map_or(true, |t| ts > *t) {
                    node.latest_timestamp = Some(ts);
                    node.latest_author = author;
                }
            }
        }
    }

    // 2️⃣ 先收集 parent-child pairs，避免 E0502
    let mut parent_child_pairs = Vec::with_capacity(node_map.len());
    for (id, node) in node_map.iter() {
        if let Some(parent_id) = &node.parent_id {
            parent_child_pairs.push((parent_id.clone(), id.clone()));
        }
    }

    // 3️⃣ 遍历 pairs，安全可变借用 node_map
    for (parent_id, child_id) in parent_child_pairs {
        // 先获取 child 的 clone，避免不可变借用和可变借用同时存在
        if let Some(child_node) = node_map.get(&child_id).cloned() {
            if let Some(parent) = node_map.get_mut(&parent_id) {
                parent.children.push(child_node);
            }
        }
    }

    // 4️⃣ 收集根节点
    let roots: Vec<N0de> = node_map
        .values()
        .filter(|node| {
            node.parent_id.is_none() || !node_map.contains_key(node.parent_id.as_ref().unwrap())
        })
        .cloned()
        .collect();

    to_value(&roots).unwrap()
}
