import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
    server: {
        devProxy: {
            "/api": {
                target: "http://localhost:8080/",
                prependPath: false
            }
        }
    }
});
