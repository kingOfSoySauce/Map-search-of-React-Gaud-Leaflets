**网络请求部分和文章有出入，以文章为准**

# 概述

本项目是一个基于React的地图搜索组件demo项目，使用Leaflets插件作为地图容器，利用高德地图提供的poi接口实现地图搜索。

目的：将搜索功能封装成一个组件，以便其他项目可以通过引入此组件**快速添加**地图搜索功能。只需在已经使用Leaflets插件的项目中**新增一行代码**即可实现搜索功能，这样任何使用Leaflets插件的项目都能方便地添加地图搜索功能。

```jsx
//引入此项目
import MapSearch from "@/components/MapSearch";

//新增一行代码
<MapSearch map={map}></MapSearch>
```

文章：[React+高德+Leaflets的简单地图搜索](https://juejin.cn/post/7208858443630624828)

技术栈：[React](https://react.docschina.org/)、[Leaflets](https://leafletjs.cn/)、[高德搜索POI 2.0](https://developer.amap.com/api/webservice/guide/api/newpoisearch)

功能：
1.  关键字搜索
1.  结果标到地图上
1.  鼠标移入结果列表，地图跳转到对应位置并弹窗
