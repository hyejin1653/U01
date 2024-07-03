<template>
  <div ref="map" class="appMain">
    <title-bar
      title1="항로표지 기반 생태정보 분석"
      title2="서비스"
      version="Version 1.0"
    ></title-bar>
    <status-bar :zoom="zoom" :WGS84_Pos="WGS84_Pos"></status-bar>
    <div v-if="routeShow">
      <route-sign-detail
        class="routeSign"
        :routeCd="routeCd"
        :selectFlag="selectFlag"
        @closeRign="closeRign"
      ></route-sign-detail>
    </div>
    <menu-bar
      :class="{ menubarC: routeShow }"
      :resultSign="resultSignD"
    ></menu-bar>

    <div v-if="chartView" class="chartDv">
      <temper-chart
        :style="{ left: xPosition, top: yPosition }"
        class="tempChart"
        :routeCd="routeCd"
        :routeObs="routeObs"
      ></temper-chart>
    </div>

    <route-result class="routeDetail" v-if="showResult"></route-result>
  </div>
</template>
<script>
import View from "ol/View";
import Map from "ol/Map";
import TileLayer from "ol/layer/Tile";
import { transform, transformExtent } from "ol/proj";
import XYZ from "ol/source/XYZ";
import GeoJSON from "ol/format/GeoJSON";
import { toStringHDMS } from "ol/coordinate";
//import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {
  Style,
  Icon,
  Text,
  Fill,
  Stroke,
  Circle as CircleStyle,
} from "ol/style";
import Feature from "ol/Feature";
import Select from "ol/interaction/Select";
import Overlay from "ol/Overlay";
import { click } from "ol/events/condition";

import signInfo from "./signInfo.json";
import TitleBar from "@/components/TitleBar";
import StatusBar from "@/components/StatusBar";
import MenuBar from "@/components/MenuBar";
import RouteSignDetail from "@/components/RouteSignDetail";
import TemperChart from "./TemperChart.vue";

import "ol/ol.css";
import RouteResult from "./RouteResult.vue";

//let pointStyle = null;
let map;
let selectPoint;
let popup;
let vectorSource;
let vectorLayer;

export default {
  name: "MapMain",
  components: {
    StatusBar,
    MenuBar,
    TitleBar,
    RouteSignDetail,
    TemperChart,
    RouteResult,
  },

  props: {},

  data() {
    return {
      zoom: 8,
      font: '11px "Open Sans", "Arial Unicode MS", "sans-serif"',
      WGS84_Pos: {
        long: "",
        lat: "",
        HDMS_long: "",
        HDMS_lat: "",
      },
      dialog: true,
      routeSignData: null,
      routeShow: false,
      routeCd: "",
      resultSignD: [],
      resultData: [],
      selectFlag: "NO",
      chartView: false,
      routeObs: "",
      xPosition: "50px",
      yPosition: "550px",
      shiftX: 0,
      shiftY: 0,
      isPress: false,
      showResult: false,
    };
  },

  async mounted() {
    this.selectData();
    //this.signData(signInfo);
    var rtnValue = [127.9653, 35.9859];
    let extent = [135.0011, 32.0034, 120.9395, 44.0869];
    let vueThis = this; //맵관련 이벤트 발생시에 함수 호출할때 사용

    vectorSource = new VectorSource({ features: [] });
    vectorLayer = new VectorLayer({
      source: vectorSource,
      zIndex: 3,
      name: "route",
    });
    // this is where we create the OpenLayers map
    map = new Map({
      // the map will be created using the 'map-root' ref
      target: this.$refs["map"],
      layers: [
        // adding a background tiled layer
        new TileLayer({
          source: new XYZ({
            url: "http://118.38.20.105:8080/ENC_RAS/{z}/{x}/{y}.png",
          }), // tiles are served by OpenStreetMap
        }),
        vectorLayer,
      ],
      // the map view will initially show the whole world
      view: new View({
        projection: "EPSG:3857", //osm 구글지도[x좌표, y좌표]
        extent: transformExtent(extent, "EPSG:4326", "EPSG:3857"),
        center: transform(rtnValue, "EPSG:4326", "EPSG:3857"),
        zoom: vueThis.zoom,
        constrainResolution: true,
        minZoom: 7,
        maxZoom: 17,
      }),
      controls: [],
    });

    map.on("pointermove", (event) => {
      var point = transform(event.coordinate, "EPSG:3857", "EPSG:4326");
      var long = Math.round(parseFloat(point[0]) * 10000) / 10000;
      var lat = Math.round(parseFloat(point[1]) * 10000) / 10000;
      //console.log(point);
      var pos_str = toStringHDMS(point);
      var pos_arr = pos_str.split("N");
      var long_HDMS = pos_arr[1].replace("E", "");
      var lat_HDMS = pos_arr[0];
      // console.log(long_HDMS, lat_HDMS);

      this.WGS84_Pos.long = long;
      this.WGS84_Pos.lat = lat;
      this.WGS84_Pos.HDMS_long = long_HDMS;
      this.WGS84_Pos.HDMS_lat = lat_HDMS;
    });

    map.on("moveend", function (e) {
      var newZoom = map.getView().getZoom();
      //줌 완료 시 이벤트.
      //console.log(Math.round(parseFloat(newZoom) * 10) / 10);
      vueThis.zoom = Math.round(parseFloat(newZoom) * 10) / 10;
    });

    map.on("click", function (e) {
      let feature = map.forEachFeatureAtPixel(
        e.pixel,
        function (feature, layer) {
          return feature;
        },
        {
          layerFilter: function (layer) {
            return layer.get("name") === "route";
          },
        }
      );

      //vectorSource.getFeatureById();
      if (feature) {
        //console.log(vueThis.resultData);
        let text = feature.getId().split(",");

        vueThis.routeCd = text[0];
        vueThis.routeShow = true;

        //console.log(text);

        let singArr = vueThis.resultData
          .filter(function (e) {
            return e.SIGN_CD == text[0];
          })
          .map(function (e) {
            return e;
          });

        if (singArr[0].FLG == "YES") {
          //vueThis.showChart(singArr[0].LONGITUDE, singArr[0].LATITUDE);
          vueThis.showChart(singArr[0].OBS_POST_ID);
        } else {
          vueThis.closeTemper();
        }

        //console.log("selectPoint!!!!!!!!!", selectPoint);

        if (selectPoint != null) {
          map.removeInteraction(selectPoint);
        }
        selectPoint = new Select({
          condition: click,
          style: new Style({
            image: new CircleStyle({
              radius: 9,
              fill: new Fill({
                color: "blue",
              }),
              stroke: new Stroke({
                color: "white",
                width: 3,
              }),
            }),
            text: new Text({
              font: 'bold 13px "Open Sans", "Arial Unicode MS", "sans-serif"',
              textAlign: "center",
              text: text[1],
              offsetX: 0,
              offsetY: 0,
              fill: new Fill({
                color: "#000",
              }),
              stroke: new Stroke({
                color: "yellow",
                width: 3,
              }),
              z_index: 3,
            }),
          }),
        });
        map.addInteraction(selectPoint);
      }
    });

    // if(feature){
    //     if(feature.get('text') != "" || feature.get('text') != undefined)
    //     {
    //         console.log(feature.get('text'), feature.get('textValue'))
    //         let result = vueThis.resultData.filter((item) => item.SIGN_CD === feature.get('text'));

    //         vueThis.routeShow = true;
    //         vueThis.routeCd = feature.get('text');
    //         vueThis.selectFlag = result[0].FLG;

    //         if (selectPoint != null) {
    //             map.removeInteraction(selectPoint);
    //         }

    //         console.log(selectPoint);

    //         // if(result[0].FLG == "NO")
    //         // {
    //         //     vueThis.routeShow = false;
    //         //     vueThis.routeCd = "";
    //         //     return;
    //         // }

    //
    //     }
    // }else{
    //     //vueThis.routeShow = false;
    //     //vueThis.routeCd = "";
    // }
    //console.log(features.get('text'));

    // this.$http.get("/route/utilization/u01s02").then((res) => {
    //   //console.log(res.data);
    // });
  },
  methods: {
    async selectData() {
      let signList = await this.selectRouteSign();
      let allList = await this.selectAll();

      //console.log(signList, allList);

      this.resultSignD = signList;
      this.resultData = allList;
    },
    changeDoBunCho(val1, val2, val3) {
      var rVar = Number(val1) + Number(val2 / 60) + Number(val3 / 3600);
      return rVar;
    },
    signData(data) {
      data.forEach((row) => {
        //console.log(row);
        let lon = row.lon.split("-");
        let lat = row.lat.split("-");
        console.log(
          row.name,
          "lon : ",
          this.changeDoBunCho(lon[0], lon[1], lon[2]),
          ", lat : ",
          this.changeDoBunCho(lat[0], lat[1], lat[2])
        );
      });
    },
    showChart(obs_post_id) {
      this.chartView = true;
      this.routeObs = obs_post_id;
    },
    closeTemper() {
      this.chartView = false;
      this.routeShow = true;
    },
    async closeRign(routeId, routeNm, editFlag, obsPostId) {
      //console.log(routeId);
      this.routeShow = false;
      this.chartView = false;

      console.log(selectPoint);

      if (selectPoint != null) {
        map.removeInteraction(selectPoint);
      }

      //수정이 일어났을때만 새로 load
      if (editFlag) {
        this.removeMarker(routeId, routeNm, obsPostId);
        let signList = await this.selectRouteSign();
        let allList = await this.selectAll();

        //console.log(signList);

        this.resultSignD = signList;
        this.resultData = allList;
      }
    },
    //항로표지 데이터 읽어 오기
    async selectRouteSign() {
      let resultSing;
      await this.$http.get(`/api/ship/routeSignList`).then((res) => {
        let routeSign = res.data;
        for (let rout of routeSign) {
          let lon = parseFloat(rout.LONGITUDE);
          let lat = parseFloat(rout.LATITUDE);
          //console.log([lon, lat]);
          let flg = "";
          if (rout.FLG == "YES") flg = "dot";
          this.drawRouteSign(
            [lon, lat],
            rout.SIGN_CD,
            rout.SIGN_NM,
            flg,
            rout.OBS_POST_ID
          );
        }

        resultSing = routeSign
          .filter(function (e) {
            return e.FLG == "YES";
          })
          .map(function (e) {
            return e;
          });
      });

      return resultSing;
      //console.log(this.resultSignD);
    },
    async selectAll() {
      let resultD;
      await this.$http.get(`/api/ship/routeSignList`).then((res) => {
        let routeSign = res.data;
        resultD = routeSign;
      });

      return resultD;
      //console.log(this.resultSignD);
    },
    drawRouteSign(point, codeT, nameT, flag, obsPostId) {
      let img = require("../img/ico_buoy_big.png");
      let imgColor = "#FF9100";
      let textColor = "#000";
      let textBorderColor = "#fff";
      let styleF;

      if (flag == "dot") {
        //분석된 항로표지
        //img = require("../img/4.png");
        //img = require("../img/ico_buoy.png");
        imgColor = "blue";
        textBorderColor = "blue";
        textColor = "#fff";
      }

      styleF = new Style({
        image: new Icon({
          anchor: [0.5, 0.5],
          color: imgColor,
          rotation: 0,
          src: img,
          stroke: new Stroke({
            color: "#fff",
            width: 3,
          }),
        }),
        text: new Text({
          font: 'bold 13px "Open Sans", "Arial Unicode MS", "sans-serif"',
          textAlign: "center",
          text: nameT,
          offsetX: 0,
          offsetY: 0,
          fill: new Fill({
            color: textColor,
          }),
          stroke: new Stroke({
            color: textBorderColor,
            width: 3,
          }),
          z_index: 3,
        }),
      });

      let points = new Point(point);
      points.transform("EPSG:4326", "EPSG:3857");
      let feature = new Feature(points);
      feature.setStyle(styleF);
      feature.setId(codeT + "," + nameT + "," + obsPostId);
      vectorSource.addFeature(feature);

      //map.addLayer(vectorLayer);
    },
    removeMarker(routeId, routeNm, obsPostId) {
      //map.removeLayer(vectorLayer);
      let features = vectorSource.getFeatureById(
        routeId + "," + routeNm + "," + obsPostId
      );
      //console.log(features);

      //map.getLayers().getArray().filter(layer => layer.get('name') === 'route' )
      //                            .forEach(layer => map.removeLayer(layer));

      vectorSource.removeFeature(features);

      // map.getLayers().forEach(function(layer)
      //                 {
      //                     if(layer.get('name') != undefined && layer.get('name') == 'route' )
      //                         {
      //                             console.log(layer.get('name'));
      //                             //map.removeLayer(layer);
      //                         }
      //                 });
    },
    moveToSign(selectedSign) {
      let result = this.resultSignD.filter(
        (item) => item.SIGN_NM === selectedSign
      );

      //console.log(selectPoint);

      //let pointlay = map.getLayers().getArray().filter(layer => layer.get('name') === 'route' && layer.get('text') == result[0].SIGN_CD);

      if (selectPoint != null) {
        map.removeInteraction(selectPoint);
      }
      selectPoint = new Select({
        style: new Style({
          image: new CircleStyle({
            radius: 9,
            fill: new Fill({
              color: "blue",
            }),
            stroke: new Stroke({
              color: "white",
              width: 3,
            }),
          }),
          text: new Text({
            font: 'bold 13px "Open Sans", "Arial Unicode MS", "sans-serif"',
            textAlign: "center",
            text: selectedSign,
            offsetX: 0,
            offsetY: 0,
            fill: new Fill({
              color: "#000",
            }),
            stroke: new Stroke({
              color: "#fff",
              width: 3,
            }),
            z_index: 3,
          }),
        }),
      });
      map.addInteraction(selectPoint);

      let feature = vectorSource.getFeatureById(
        result[0].SIGN_CD + "," + selectedSign + "," + result[0].OBS_POST_ID
      );
      selectPoint.getFeatures().push(feature);

      /* map.getLayers().getArray().filter(layer => layer.get('text') === result[0].SIGN_CD)
                                      .forEach(layer => map.removeLayer(layer));
            

            //console.log([result[0].LONGITUDE, result[0].LATITUDE], result[0].SIGN_CD, result[0].SIGN_NM, 'dot')
            this.drawRouteSign([result[0].LONGITUDE, result[0].LATITUDE], result[0].SIGN_CD, result[0].SIGN_NM, 'dot2');*/

      let center = transform(
        [result[0].LONGITUDE, result[0].LATITUDE],
        "EPSG:4326",
        "EPSG:3857"
      );

      map.getView().setCenter(center);
      map.getView().setZoom(15);

      this.routeShow = true;
      this.routeCd = result[0].SIGN_CD;
      //this.showChart(result[0].LONGITUDE, result[0].LATITUDE);
      this.showChart(result[0].OBS_POST_ID);
    },
    searchList() {
      //console.log("dddd");
      this.showResult = !this.showResult;
    },
  },
};
</script>

<style>
.appMain {
  position: relative;
  height: 100vh;
  width: 100wh;
}
.routeSign {
  position: absolute;
  width: 500px;
  height: calc(100vh - 22px);
}
.menubarC {
  right: 520px;
}
.tempChart {
  position: absolute;
  height: 300px;
  border-radius: 50px;
  z-index: 5;
  background: rgba(255, 255, 255, 0.8);
  width: 800px;
}

.routeDetail {
  height: 500px;
  width: 610px;
  position: absolute;
  z-index: 3;
  right: 40px;
  top: 100px;
  background-color: white;
  border-radius: 10px;
  padding: 10px;
}
</style>
