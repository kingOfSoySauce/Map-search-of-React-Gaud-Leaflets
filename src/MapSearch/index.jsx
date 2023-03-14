import React, { useState, useEffect, useRef } from "react";
import { Select, message, Button } from "antd";
import { SearchOutlined, UpOutlined, DownOutlined } from "@ant-design/icons";
import { request } from "../services/services";
import coordtransform from "coordtransform";
import * as L from "leaflet";
import "./index.css";

export default function Poi(props) {
  const { map } = props;
  const selectRef = useRef(); //获取select组件

  //状态
  const [timer, setTimer] = useState(); //防抖
  const [input, setInput] = useState(); //输入的关键字
  const [select, setSelect] = useState(); //已选中的
  const [showSearchPopup, setShowSearchPopup] = useState(false); //是否弹出下拉菜单
  const [data, setData] = useState([]); //api响应结果
  const [group, setGroup] = useState(null); //保存了所有marker

  //输入地址列表,返回带jsx描述的列表,并且添加鼠标移入事件
  const format = (list) => {
    return list?.map((item) => {
      return {
        value: item.id, //id
        //将名称和地址拼接到一起
        label: (
          <div
            className="searchPopupText"
            title={item.address}
            //绑定鼠标移入事件
            onMouseEnter={(e) => {
              //当前没有选中时,弹出弹窗,有选中之后就不弹出了
              if (!select) textPopup(item, e);
            }}
          >
            <span className="left">{item.name}</span>&nbsp;
            <span className="right">{item.address}</span>
          </div>
        ),
        ...item,
      };
    });
  };

  //请求高德api
  async function send(value) {
    const { data: res } = await request({
      key: "xxx", //高德key
      keywords: value,
      region: 310151,
      city_limit: true,
      page_size: 25,
    }).catch((e) => {
      message.error(e);
    });
    console.log(res, res.pois);
    if (res.infocode === "10000" && res.pois?.length) {
      setData(res.pois);
      setShowSearchPopup(true);
    } else {
      message.error("搜索地址出错:", res.info);
    }
  }

  //图标
  const icon = () => {
    return L.divIcon({
      className: "my-div-icon poi-icon", //将标点设为背景图
      iconSize: [30, 30],
      iconAnchor: [15, 30], //图标中心点的位置，不配置缩放时图标会位移，点位也不准确
    });
  };
  // 弹出框
  const popup = (item) =>
    `
  <div  style="color:#66c9ff;font-size:16px">${item.address}</div>
  <div>名称: ${item.name}</div>
  <div>类型: ${item.type}</div>
`;

  //添加标点
  const addMarker = (
    map,
    arr,
    icon,
    popup = () => {},
    markList,
    setMarkList,
    setModalData = () => {},
    setModalOpen = () => {}
  ) => {
    let list = arr.map((item, index) => {
      //转坐标系
      const [longitude, latitude] = coordtransform.gcj02towgs84(
        ...item.location?.split(",")
      );

      //生成marker实例
      return new L.marker([latitude + "", longitude + ""], {
        icon: icon(item, index),
      })
        .bindPopup(popup(item), {
          //绑定弹出框
          closeButton: false,
          keepInView: false, //在边界弹出时，不会被边界遮挡
          offset: L.point(0, -16), //往上偏移，不遮挡标点
        })
        .on("mouseover", function () {
          //鼠标移入事件
          this.openPopup();
        })
        .on("mouseout", function () {
          //鼠标移出事件
          this.closePopup();
        })
        .on("click", function (e) {
          //鼠标点击事件，可以弹出弹出框
          setModalData(item);
          setModalOpen(true);
        });
    });

    const group = L.layerGroup(list);
    setMarkList(group);
    map.addLayer(group);
    //刷新地图对象
    map.setView(map.getCenter());
  };

  //清除标点
  const clearMarker = () => {
    if (group) {
      group.clearLayers();
      setGroup(null);
    }
  };

  //侧边栏鼠标经过时，弹出悬浮框  参数item：鼠标经过的item
  const textPopup = (item) => {
    const [longitude, latitude] = coordtransform.gcj02towgs84(
      ...item.location?.split(",")
    );

    if (latitude && longitude) {
      const p = L.popup({
        closeButton: false,
        autoPanPadding: L.point(400, 150),
        keepInView: false, //在边界弹出时，不会被边界遮挡
        offset: L.point(0, -16), //往上偏移，不遮挡标点
      })
        .setLatLng({ lat: latitude, lng: longitude })
        .setContent(popup(item))
        .openOn(map);
    }
  };

  //关闭弹窗方法
  const closePopup = () => map?.closePopup();

  //选中事件
  const onSelect = (value, item) => {
    if (item) {
      //有选中
      setSelect(item);
      textPopup(item);
      setShowSearchPopup(false);
    } else {
      //清除选中
      setSelect(item);
      textPopup(item);
      setShowSearchPopup(true);
      closePopup();
    }
  };

  //防抖发送请求
  const onSearch = (value) => {
    setTimer((timer) => {
      if (timer) {
        return clearTimeout(timer);
      }
      return setTimeout(() => send(value), 500);
    });
  };

  //获取焦点事件
  const onFocus = () => {
    if (data?.length) setShowSearchPopup(true);
  };

  //监听res,绘制地图标点
  useEffect(() => {
    if (!map || !data || !data.length) return;
    clearMarker(); //调用清空方法
    addMarker(map, data, icon, popup, group, setGroup); //调用添加图标方法
  }, [data, map]);
  return (
    <div className="poi">
      {/* 弹出下拉弹出的按钮 */}
      {data?.length !== 0 &&
        (showSearchPopup ? (
          <Button
            shape="circle"
            onClick={() => setShowSearchPopup(false)}
            icon={<UpOutlined />}
          ></Button>
        ) : (
          <Button
            shape="circle"
            onClick={() => setShowSearchPopup(true)}
            icon={<DownOutlined />}
          ></Button>
        ))}
      {/* 中间的选择组件 */}
      <Select
        className="search"
        popupClassName="searchPopup"
        allowClear
        showSearch
        placeholder="检索地址"
        optionFilterProp="children"
        onChange={onSelect}
        onSearch={setInput}
        onFocus={onFocus}
        filterOption={false} //不根据输入来检索,自己实现检索
        options={format(data)}
        suffixIcon={<></>}
        open={showSearchPopup}
        ref={selectRef}
      />
      {/* 搜索按钮 */}
      <Button
        type="primary"
        shape="round"
        onClick={() => onSearch(input)}
        icon={<SearchOutlined />}
      ></Button>
    </div>
  );
}
