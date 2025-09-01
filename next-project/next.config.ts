import type {NextConfig} from "next";
import path from "path";

const nextConfig: NextConfig = {
    /* config options here */
    webpack: (config) => {
        config.resolve.alias["@wasm"] = path.resolve(__dirname, "src/wasm_pkg");
        return config;
    },
};

export default nextConfig;
