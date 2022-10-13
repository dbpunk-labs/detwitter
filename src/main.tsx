import React from "react";
import ReactDOM from "react-dom/client";
import { RecoilRoot } from "recoil";
import App from "./App";
import "antd/dist/antd.css";
import "./index.css";

// document.domain = "db3.network";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<RecoilRoot>
		<App />
	</RecoilRoot>,
);
