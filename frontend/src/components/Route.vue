<template>
  <div >
     
  </div>
</template>
<script>
import View from 'ol/View'
import Map from 'ol/Map'
import TileLayer from 'ol/layer/Tile'
import { transform }  from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON'
import { toStringHDMS } from "ol/coordinate";
//import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Icon, Text, Fill, Stroke } from "ol/style";
import Feature from "ol/Feature";

import TitleBar from "@/components/TitleBar";
import StatusBar from "@/components/StatusBar";
import MenuBar from "@/components/MenuBar";
import RouteSignDetail from "@/components/RouteSignDetail"
import 'ol/ol.css'
import { none } from 'ol/centerconstraint';

//let pointStyle = null;
let map;
export default {
  name: 'MapMain',
  components: {
      StatusBar,
      MenuBar,
      TitleBar,
      RouteSignDetail
  },
  props: {},
  data(){
    return {
        zoom : 12,
        font: '11px "Open Sans", "Arial Unicode MS", "sans-serif"',
        //알아서 메뉴 추가 
        menus: [
            { title: "통항량 통계", icon: ["fas", "ship"] },
            { title: "교신 통계", icon: ["fas", "check-double"] },
            { title: "사고 통계", icon: ["fas", "file-medical-alt"] },
            { title: "내 정보", icon: ["fas", "user"] },
            { title: "로그아웃", icon: ["fas", "sign-out-alt"] },
        ],
        WGS84_Pos: {
            long: "",
            lat: "",
            HDMS_long: "",
            HDMS_lat: "",
        },
        routeSignData : null,
        routeNm : "",
        routeSign : false
    }
  },
  watch:{
      routeSign : function(){
          console.log('chabge')
      }
  },
  mounted() {
        var rtnValue = transform([129.0933, 35.07448],"EPSG:4326","EPSG:3857");

        // this is where we create the OpenLayers map
        map = new Map({
                    // the map will be created using the 'map-root' ref
                      target: this.$refs['map'],
                      layers: [
                          // adding a background tiled layer
                          new TileLayer({
                              source: new XYZ({
                                  url: 'http://155.155.4.93:8080/ENC_RAS/{z}/{x}/{y}.png'
                              }) // tiles are served by OpenStreetMap
                          }),
                      ],
                      // the map view will initially show the whole world
                      view: new View({
                          zoom: 12,
                          center: rtnValue,
                          constrainResolution: true
                      }),

                  }); 

        map.on('pointermove', (event) => {
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

        this.selectRouteSign();

        map.on('click', function(e){
            let features = map.forEachFeatureAtPixel(e.pixel, function(feature, layer) {
                return layer;
            },{
                layerFilter: function(layer) {
                    return layer.get('name') === 'route';
                }
            });
        
            if(features){
                if(features.get('text') != "" || features.get('text') != undefined)
                {
                    console.log('ddd')
                    this.routeNm = features.get('text');
                    this.routeSign = true;
                    this.clickMap();
                }
            }
            //console.log(features.get('text'));
        });
  },
  methods:{
        clickMap(){
            console.log('ddd')
        },
        //항로표지 데이터 읽어 오기
        selectRouteSign(){
            this.$http.get(`/api/ship/routeSignList`).then((res) => {   
                //console.log(res.data);
                let routeSign = res.data;
                for(let rout of routeSign)
                {
                    let lon = parseFloat(rout.LONGITUDE);
                    let lat = parseFloat(rout.LATITUDE);
                    //console.log([lon, lat]);
                    this.drawRouteSign([lon, lat], rout.SIGN_NM);
                }
            });
        },
        drawRouteSign(point, nameT){
            let vectorSource = new VectorSource({ features: [] });
            let vectorLayer = new VectorLayer({
                    source: vectorSource,
                    zIndex : 3,
                    name: 'route',
                    text : nameT
                });

            let styleF = new Style({
                            image: new Icon({
                                anchor: [0.5, 0.5],
                                color: "#FF9100",
                                rotation: 0,
                                src: require("../img/ico_buoy_big.png"),
                            }),
                            text: new Text({
                                font: 'bold 13px "Open Sans", "Arial Unicode MS", "sans-serif"',
                                textAlign: 'center',
                                text: nameT,
                                offsetX: 0,
                                offsetY: 0,
                                fill: new Fill({
                                    color: '#000'
                                }),
                                stroke: new Stroke({
                                    color: '#fff',
                                    width: 3
                                }),
                                z_index:3,
                            }),
                        });
            
            let points = new Point(point);
            points.transform("EPSG:4326", "EPSG:3857");
            let feature = new Feature(points);
            feature.setStyle(styleF);
            vectorSource.addFeature(feature);

            map.addLayer(vectorLayer);
        }
  },
}
</script>


<style>

</style>
