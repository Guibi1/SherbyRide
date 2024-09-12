// @refresh reload
import { StartClient, mount } from "@solidjs/start/client";

// biome-ignore lint/style/noNonNullAssertion: App is doomed
mount(() => <StartClient />, document.getElementById("app")!);
