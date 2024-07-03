<template>
  <!-- v-if="routeShow" -->
  <div class="dtl gc-scrollbar">
    <div class="div_top">
      <div class="header1 d-flex">
        <div class="titleCls">{{ dtl.SIGN_NM }}</div>
        <v-spacer></v-spacer>
        <div class="closeBtn">
          <v-icon @click="closeRouteSign()" dark>mdi-close</v-icon>
          <!-- <v-btn fab dark small color="primary" @click="closeRouteSign()"
            ><font-awesome-icon icon="fa-times"
          /></v-btn> -->
        </div>
      </div>
      <div class="body1">
        <v-simple-table>
          <tbody>
            <tr>
              <td class="titleCol">분석일</td>
              <td>{{ dtl.DT }}</td>
            </tr>
            <tr>
              <td class="titleCol">운영기간</td>
              <td>{{ dtl.DURING }}</td>
            </tr>
            <tr>
              <td class="titleCol">경도</td>
              <td>{{ dtl.LON }}E</td>
            </tr>
            <tr>
              <td class="titleCol">위도</td>
              <td>{{ dtl.LAT }}N</td>
            </tr>
            <tr>
              <td class="titleCol">수온평균</td>
              <td>{{ dtl.KOOFS }}℃</td>
            </tr>
            <tr>
              <td class="titleCol">염분평균</td>
              <td>{{ dtl.SOLA }}%</td>
            </tr>
            <tr>
              <td class="titleCol">유속평균</td>
              <td>{{ dtl.SEC }}(m/sec)</td>
            </tr>
          </tbody>
        </v-simple-table>
      </div>
    </div>
    <div class="div_bottom">
      <div class="header2">분석 결과</div>
      <!-- <div class="addBtn">
        <v-row>
          <v-col cols="9">
            <v-file-input
              v-model="imgFile"
              accept="image/*"
              label="File input"
              dense
              multiple
              color="pink"
              prepend-icon="mdi-camera"
              class="fileInput"
              @change="addFiles"
            ></v-file-input>
          </v-col>
          <v-col cols="1">
            <v-btn
              rounded
              small
              color="secondary"
              dark
              dense
              @click="addImage()"
              >추가</v-btn
            >
          </v-col>
        </v-row>
      </div> -->
      <div class="image">
        <!-- <div v-if="routeNm == '추자항4호등부표'">
                    <img class="result_img" src="../img/추자4호3.jpg" />
                    <img class="result_img" src="../img/추자4호7.jpg" />
                </div>
                <div v-else-if="routeNm == '추자항5호등부표'">
                    <img class="result_img" src="../img/추자5호1.jpg" />
                    <img class="result_img" src="../img/추자5호9.jpg" />
                </div>
                <div v-else>
                    <img class="result_img" src="../img/추자5호1.jpg" />
                    <img class="result_img" src="../img/추자5호9.jpg" />
                </div> -->
        <div v-for="(file, f) in imgFile" :key="f" class="imgDiv gc-scrollbar">
          <img :ref="'file'" class="result_img" />
        </div>
        <div v-for="file in imgSrc" :key="file.row" class="imgDiv gc-scrollbar">
          <div class="imgSubDiv">
            <img :src="file.context" class="result_img" />
          </div>
          <div class="resultDiv gc-scrollbar">
            <!-- <v-simple-table>
                            <tbody>
                            <tr v-for="i in file.result" :key="i.TITLE" >
                                <td>- {{i.TITLE}} : {{i.CNT}}개체</td>
                                <td>({{i.PAR}}%)</td>
                            </tr>
                            </tbody>
                        </v-simple-table>-->
            <!-- <v-list v-for="i in file.result" :key="i.class" dense>
              <v-list-item dense> - {{ i.class }} : {{ i.cnt }} % </v-list-item>
            </v-list> -->
            <div v-for="i in file.result" :key="i.class" class="resultdetail">
              - {{ i.class }} : {{ i.cnt }} %
            </div>
          </div>
        </div>
        <div v-if="historyCnt > 1" style="padding: 10px; height: 200px">
          <div class="table_style">
            <div style="width: 50%">등록일자</div>
            <div style="width: 50%">파일명</div>
          </div>
          <div v-for="(item, index) of historyList" :key="index">
            <div class="table_style">
              <div style="width: 45%">{{ item.insertDt }}</div>
              <div style="width: 50%">{{ item.fileNm }}</div>
              <div>
                <v-btn
                  size="xsmall"
                  icon
                  height="20px"
                  @click="detailShow(index)"
                  ><v-icon v-if="!item.flag"
                    >mdi-arrow-down-drop-circle-outline</v-icon
                  ><v-icon v-if="item.flag"
                    >mdi-arrow-up-drop-circle-outline</v-icon
                  ></v-btn
                >
              </div>
            </div>
            <div class="imgDiv gc-scrollbar" v-if="item.flag">
              <div class="imgSubDiv">
                <img :src="item.context" class="result_img" />
              </div>
              <div class="resultDiv gc-scrollbar">
                <!-- <v-list v-for="i in item.resultDt" :key="i.class" dense>
                  <v-list-item dense>
                    <v-list-item-content
                      ><v-list-item-title
                        >- {{ i.class }} : {{ i.cnt }} %
                      </v-list-item-title></v-list-item-content
                    >
                  </v-list-item>
                </v-list> -->
                <div
                  v-for="i in item.resultDt"
                  :key="i.class"
                  class="resultdetail"
                >
                  - {{ i.class }} : {{ i.cnt }} %
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";

export default {
  name: "RouteSignDetail",
  props: ["routeCd", "selectFlag"],
  watch: {
    routeCd: function () {
      this.selectRouteSign();
      //this.showResult();
    },
  },
  data() {
    return {
      item: null,
      dtl: {},
      imgFile: [],
      readers: [],
      imgSrc: [],
      rowCnt: 0,
      resultDtl: {},
      editFlag: false,

      baseDt: "",

      historyCnt: 0,
      historyList: [],
      historyHeader: [
        { text: "등록일자", align: "center", value: "insert_dt" },
      ],
      historyDetail: [],
    };
  },
  methods: {
    async selectRouteDetail() {
      let resultObj = new Object();
      await this.$http
        .get(`/api/ship/routeSignInfo/${this.routeCd}`)
        .then((res) => {
          let rout = res.data[0];
          resultObj = rout;
        });

      return resultObj;
    },
    showResult() {
      // if(this.selectFlag == "NO")
      // {
      this.resultFlag = !this.resultFlag;
      // }
    },
    selectRouteSign() {
      //console.log(this.routeCd);
      this.$http.get(`/api/ship/routeSignInfo/${this.routeCd}`).then((res) => {
        //console.log(res.data);
        //console.log(res.data[0]);
        let rout = res.data[0];
        let weather = res.data[1];

        //console.log(weather);
        let resultObj = new Object();
        resultObj["DT"] = rout.SIGN_DT == null ? "2022.11.10" : rout.SIGN_DT;
        resultObj["SIGN_NM"] = rout.SIGN_NM;
        resultObj["DURING"] = "2년"; //운영기간

        let doL = parseInt(rout.LONGITUDE);
        let bunL = parseInt((parseFloat(rout.LONGITUDE) - doL) * 60);
        let choL = (
          ((parseFloat(rout.LONGITUDE) - doL) * 60 - bunL) *
          60
        ).toFixed(0);

        bunL = bunL.toString().length == 1 ? "0" + bunL.toString() : bunL;
        let resultLon = doL + "-" + bunL + "-" + choL;

        let doA = parseInt(rout.LATITUDE);
        let bunA = parseInt((parseFloat(rout.LATITUDE) - doA) * 60);
        let choA = (
          ((parseFloat(rout.LATITUDE) - doA) * 60 - bunA) *
          60
        ).toFixed(0);

        bunA = bunA.toString().length == 1 ? "0" + bunA.toString() : bunA;
        let resultLat = doA + "-" + bunA + "-" + choA;
        resultObj["LON"] = resultLon;
        resultObj["LAT"] = resultLat;
        resultObj["KOOFS"] = weather.KOOFS; //수온
        resultObj["SOLA"] = weather.SOLA; //염분
        resultObj["SEC"] = weather.SEC; //유속

        resultObj["LONGITUDE"] = rout.LONGITUDE; //유속
        resultObj["LATITUDE"] = rout.LATITUDE; //유속

        resultObj["AREA"] = rout.AREA; //해역

        resultObj["OBS_POST_ID"] = weather.obs_post_id; //근처 기상정보 항로표지

        this.dtl = resultObj;
      });

      //이미지파일
      this.$http.get(`/api/ship/routeSignImg/${this.routeCd}`).then((res) => {
        //console.log(res.data);
        let imgDt = res.data[0];
        let resultDtl = res.data[1];

        console.log(imgDt);

        let baseDt;
        let valueData = [];

        for (let img of imgDt) {
          let resultDt = resultDtl.filter(
            (item) => item.sign_seq == img.SIGN_SEQ
          );

          let obj = {};
          obj["context"] = "data:image/jpg;base64," + img.FILE_DATA;
          obj["result"] = resultDt;

          valueData.push(obj);
          baseDt = resultDt.length == 0 ? "" : resultDt[0].base_dt;
        }

        if (baseDt != "") {
          this.dtl.DT =
            baseDt.substring(0, 4) +
            "-" +
            baseDt.substring(4, 6) +
            "-" +
            baseDt.substring(6, 8) +
            " " +
            baseDt.substring(8, 10) +
            ":" +
            baseDt.substring(10, 12);
        }

        this.imgSrc = valueData;
        this.historyCnt = res.data[4].length;

        let histroyFile = res.data[3];
        let historyDetail = res.data[4];
        this.historyDetail = res.data[4];

        let historyArr = [];
        for (let history of histroyFile) {
          let resultDt = historyDetail.filter(
            (item) => item.sign_seq == history.SIGN_SEQ
          );

          let obj = {};
          obj["fileNm"] = history.FILE_NAME;
          obj["insertDt"] = history.INSERT_DT;
          obj["context"] = "data:image/jpg;base64," + history.FILE_DATA;
          obj["resultDt"] = resultDt;
          obj["sign_seq"] = history.SIGN_SEQ;
          obj["flag"] = false;

          historyArr.push(obj);
        }

        console.log(historyArr);

        this.historyList = historyArr;
      });
      /*this.$http.get(`/api/ship/routeSignImg/${this.routeCd}`).then((res) => {
        //console.log(res.data[0], res.data[1]);
        let imageDtl = res.data[0];
        let resultDtl = res.data[1];

        console.log(imageDtl);
        console.log(resultDtl);
        // if (res.data[1] != undefined) {
        //   let dt = res.data[2].dt;
        //   console.log(dt);
        //   this.baseDt = dt;
        // }

        //console.log(imageDtl);
        let valueData = [];
        let cnt = 1;
        for (let row = 0; row < imageDtl.length; row++) {
          //console.log(resultDtl[row]);
          let obj = {};
          obj["row"] = cnt;
          obj["context"] = "data:image/jpg;base64," + imageDtl[row];
          obj["result"] = resultDtl[row];
          valueData.push(obj);
          cnt++;
        }
        this.imgSrc = valueData;
      });*/
      /*this.$http.get(`/api/ship/readTxtFile/${this.routeCd}`).then((res) => {
        console.log(res.data);
        this.item = res.data;
      });*/
    },
    addFiles() {
      //console.log('files', this.imgFile);
      this.imgFile.forEach((file, f) => {
        this.readers[f] = new FileReader();
        this.readers[f].onloadend = (e) => {
          let fileData = this.readers[f].result;
          let imgRef = this.$refs.file[f];
          imgRef.src = fileData;
          // send to server here...
        };

        this.readers[f].readAsDataURL(this.imgFile[f]);
      });
    },
    async addImage() {
      console.log(process.env.VUE_APP_FILE_URL);
      if (this.imgFile != null) {
        let formData = new FormData();
        for (let i in this.imgFile) {
          formData.append("file", this.imgFile[i]);
          //console.log(this.imgFile[i]);
        }

        let resultTxt = await axios
          .post("/file/receiver", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((res) => {
            //alert("파일저장 성공");
            console.log(res.data);
            return res.data;
          })
          .catch((err) => {
            console.log(err);
            return null;
          });

        resultTxt =
          resultTxt === null
            ? "{ 'result' : 'noData'}"
            : JSON.stringify(resultTxt);
        formData.append("resultTxt", resultTxt);

        console.log("resultTxt", resultTxt);

        await axios
          .post("/api/ship/imageUpload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          .then(({ data }) => {
            alert("파일저장 성공");
            console.log("1" + data);
            this.imgFile = null;
            this.selectRouteSign();
            this.editFlag = true;
            this.$parent.showChart(this.dtl.OBS_POST_ID);
            this.$parent.getData();
          })
          .catch((err) => console.log(err));
      }
      // axios
      //   .post("/api/ship/imageUpload", formData, {
      //     headers: { "Content-Type": "multipart/form-data" },
      //   })
      //   .then(({ data }) => {
      //     alert("파일저장 성공");
      //     console.log("1" + data);
      //     this.imgFile = null;
      //     this.selectRouteSign();
      //     this.editFlag = true;
      //     this.$parent.showChart(this.dtl.OBS_POST_ID);
      //     this.$parent.getData();
      //   })
      //   .catch((err) => console.log(err));

      //   //, { headers: { 'Content-Type': 'multipart/form-data' } }
      //   // this.$http.post(`/api/ship/imageUpload`, formData).then((res) => {

      //   // });
      // }
    },
    closeRouteSign() {
      //this.$emit('closeRign');
      this.$emit(
        "closeRign",
        this.routeCd,
        this.dtl.SIGN_NM,
        this.editFlag,
        this.dtl.OBS_POST_ID
      );
    },
    detailShow(seq) {
      this.historyList[seq].flag = !this.historyList[seq].flag;
    },
  },
  mounted() {
    // this.$http.get("/route/utilization/u01s01").then((res) => {
    //   //console.log(res.data);
    // });
    this.selectRouteSign();
    //this.showResult();
    //console.log(this.selectFlag);
  },
};
</script>
<style>
.dtl {
  right: 0px;
  position: absolute;
  overflow-y: scroll;
  overflow-x: hidden;
  z-index: 3;
  background: rgba(254, 254, 254, 90%);
  font-family: "Nanum Gothic", sans-serif;
}
.div_top {
  height: 400px;
}
.div_bottom {
  height: calc(100vh - 445px);
}
.header1 {
  border-radius: 5px;
  background: #6699cc;
  padding: 11px 12px;
  margin-bottom: 5px;
  height: 50px;
  color: #fff;
  text-align: center;
  font-size: 22px;
}
.header2 {
  border-radius: 1px;
  background: #6699cc;
  padding: 8px 12px;
  margin-bottom: 5px;
  height: 40px;
  color: #fff;
  text-align: center;
  font-size: 16px;
}
.body1 {
  padding: 0px 5px 0px;
}
.titleCol {
  width: 100px;
}
.result_img {
  height: 180px;
}
.imgDiv {
  height: 200px;
  display: flex;
}
.addBtn {
  text-align: right;
  height: 45px;
}
.row {
  height: 30px;
}
.closeBtn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.imgSubDiv {
  width: 50%;
}
.resultDiv {
  height: 180px;
  width: 50%;
  background: white;
  font-size: 12px;
  overflow-y: scroll;
}
.tr {
  height: 25px;
}

.gc-scrollbar2::-webkit-scrollbar {
  width: 5px;
  height: 5px;
  background-color: #bad6f2;
}

.gc-scrollbar2::-webkit-scrollbar-thumb {
  background-color: #6699cc;
}

.gc-scrollbar2::-webkit-scrollbar-track {
  /* -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3); */
  background-color: #d3e2f1;
}
.gc-scrollbar2::-webkit-scrollbar-thumb {
  /* 스크롤 막대 색상 */
  background-color: #6699cc;
}

.gc-scrollbar2::-webkit-scrollbar-track {
  /* -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3); */
  /* 스크롤바 트랙 색상 */
  background-color: #d3e2f1;
}

.table_style {
  display: flex;
  font-size: 12px;
  text-align: center;
  margin-bottom: 5px;
}

.resultdetail {
  height: 30px;
  width: 100%;
  padding: 18px;
}
</style>
