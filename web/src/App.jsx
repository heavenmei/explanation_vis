import React, { useEffect, useState } from "react";
import MenuBar from "./mods/MenuBar";
import { Layout } from "antd";

import "./index.scss";
import { useReducerContext } from "./service/store";
import { api } from "./service/request";
import _ from "lodash";
import { MENU } from "./constants";
import LocalPage from "./mods/LocalPage";
import EditPage from "./mods/EditPage";

const { Content, Footer, Sider } = Layout;

function App() {
  const { dispatch } = useReducerContext();
  const [activeMenu, setActiveMenu] = useState("edit");

  return (
    <Layout hasSider className="App">
      <Sider
        theme="light"
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <MenuBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      </Sider>
      <Layout
        className="site-layout"
        style={{ marginLeft: 200, background: "white" }}
      >
        <Content style={{ margin: "24px 50px", overflow: "initial" }}>
          {activeMenu === MENU.local && <LocalPage />}
          {activeMenu === MENU.edit && <EditPage />}
        </Content>
        <Footer style={{ textAlign: "center" }}>
          提高用户信任度的机器学习解释系统 ©2023 Created by Heaven
        </Footer>
      </Layout>
    </Layout>
  );
}

export default App;
