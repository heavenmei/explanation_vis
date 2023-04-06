import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import _ from "lodash";
import LocalTable from "@/components/LocalTable";
import DiceTable from "@/components/DiceTable";
import { useReducerContext } from "@/service/store";
import { Button, Tabs } from "antd";
import { adult_target_value as targetName } from "@/constants";

import InfluenceDrawer from "../components/InfluenceDrawer";
import { predictionTag } from "@/components/tags";
import { draw_percent_bar } from "@/components/percentage_bar";
import { api } from "@/service/request";

function LocalPage() {
  const {
    state: { currentId, curSample, curAnchor, compareItem },
    dispatch,
  } = useReducerContext();
  const percentBar = useRef();
  const [inDrawerVisible, setInDrawerVisible] = useState(false);
  const [diceVisible, setDiceVisible] = useState(false);
  const [featureIdx, setFeatureIdx] = useState(0);
  const [featureName, setFeatureName] = useState();
  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [cfsList, setCfsList] = useState([]);
  const [posData, setPosData] = useState([]);
  const [negData, setNegData] = useState([]);

  useEffect(() => {
    setTableLoading(true);
    api("getInstance", currentId).then((res) => {
      const { sample, anchor } = res;
      setTableLoading(false);
      dispatch({
        type: "setCurSample",
        payload: { sample: sample, anchor: anchor },
      });
    });
    api("getDiceData", currentId).then((res) => {
      setCfsList(res.cfs_list);
      setDiceVisible(true);
    });
  }, [currentId, dispatch]);

  useEffect(() => {
    setTableData([curSample]);
    curSample && draw_percent_bar(percentBar.current, curSample?.percentage);
  }, [curSample]);

  useEffect(() => {
    setPosData(curAnchor?.examples[featureIdx].covered_true);
    setNegData(curAnchor?.examples[featureIdx].covered_false);
    // const anTmp = [];
    // const ct = curAnchor?.examples[featureIdx].covered_true;
    // const cf = curAnchor?.examples[featureIdx].covered_false;
    // targetName[0] === curSample?.prediction
    //   ? anTmp.push(...[ct, cf])
    //   : anTmp.push(...[cf, ct]);

    // setTableData([
    //   curSample,
    //   {
    //     id: `Examples where the modelagent predicts ${targetName[0]}`,
    //     description: true,
    //     children: anTmp[0],
    //   },
    //   {
    //     id: `Examples where the modelagent predicts ${targetName[1]}`,
    //     description: true,
    //     children: anTmp[1],
    //   },
    // ]);
  }, [curAnchor, curSample, featureIdx]);

  useEffect(() => {
    setFeatureIdx(0);
    setFeatureName(curAnchor?.feature[0]);
  }, [curAnchor?.feature]);

  const onButtonClick = useCallback(
    (index) => {
      setFeatureIdx(index);
      setFeatureName(curAnchor?.feature.slice(0, index + 1));
    },
    [curAnchor?.feature]
  );

  useEffect(() => {
    if (!compareItem) return;
    api("getInstance", compareItem.id).then((res) => {
      const { sample, anchor } = res;
      const child = tableData[3]?.children
        ? [...tableData[3]?.children, sample]
        : [sample];

      setTableData([
        ...tableData.slice(0, 3),
        {
          id: `influence example`,
          description: true,
          children: _.uniqBy(child, "id"),
        },
      ]);
    });
  }, [compareItem?.id]);

  const onTabChange = (key) => {
    console.log(key);
  };

  const TabItems = [
    {
      key: "1",
      label: `相似正例`,
      children: (
        <div key="ksksks">
          <LocalTable
            // key="相似正例"
            // tableLoading={tableLoading}
            tableData={posData}
            featureName={featureName}
          />
        </div>
      ),
    },
    {
      key: "2",
      label: `相似反例`,
      children: (
        <div key="0222">
          <LocalTable
            // key="相似反例"
            // tableLoading={tableLoading}
            tableData={negData}
            featureName={featureName}
          />
        </div>
      ),
    },
    {
      key: "3",
      label: `反事实解释`,
      children: (
        <DiceTable
          tableLoading={tableLoading}
          tableData={cfsList}
          featureName={featureName}
        />
      ),
    },
    {
      key: "4",
      label: `Tab 3`,
      children: `Content of Tab Pane 3`,
    },
  ];

  return (
    <div className="localPage">
      <div className="top">
        <span style={{ marginRight: 50 }}>ID: {curSample?.id}</span>
        <svg ref={percentBar} className="percentBar" />
        <div className="topBtn">
          <Button type="primary" onClick={() => setInDrawerVisible(true)}>
            Open Influence
          </Button>
          <Button type="primary">Open Dice</Button>
        </div>
      </div>
      <div className="action">
        If all of these are true:
        <span className="buttonGroup">
          {curAnchor?.feature.map((item, index) => (
            <Button
              key={index}
              className="btn"
              value={index}
              onClick={() => onButtonClick(index)}
              type={index <= featureIdx ? "primary" : "default"}
            >
              {item}
            </Button>
          ))}
        </span>
        The model will predict&nbsp;
        {predictionTag(curSample?.prediction)}
        <span style={{ fontSize: 20, fontWeight: 500 }}>
          {Number(curAnchor?.precision[featureIdx] * 100).toFixed(2)}%
        </span>
        &nbsp;of the time
      </div>

      <LocalTable
        tableLoading={tableLoading}
        tableData={tableData}
        featureName={featureName}
      />
      <Tabs defaultActiveKey="1" items={TabItems} onChange={onTabChange} />

      {/* 影响示例抽屉 */}
      {inDrawerVisible && (
        <InfluenceDrawer open={inDrawerVisible} setOpen={setInDrawerVisible} />
      )}
    </div>
  );
}

export default LocalPage;
