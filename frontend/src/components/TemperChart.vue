<template>
  <div>
    <v-card outlined class="chartC">
      <div class="cboC2">{{ obsNm }} 기상정보</div>
      <div class="cboC">
        <input
          class="selectSt"
          v-model="selectedSign"
          @click="clearGun"
          @change="chartChange"
          type="text"
          list="gun"
        />
        <datalist id="gun">
          <option v-for="(sign, index) in listGub" :key="index">
            {{ sign.GUBUN }}
          </option>
        </datalist>
      </div>
      <div class="closeBtn_chart">
        <v-icon @click="closeTemper()">mdi-close</v-icon>
        <!-- <v-btn fab dark small color="primary" @click="closeTemper()"
          ><font-awesome-icon icon="fa-times"
        /></v-btn> -->
      </div>
      <canvas id="temperChart"></canvas>
    </v-card>
  </div>
</template>

<script>
import Chart from "chart.js/auto";
export default {
  name: "TemperChart",
  props: ["routeCd", "routeObs"],
  watch: {
    routeCd: function () {
      console.log(this.routeObs);
      //console.log(this.routeLon, this.routeLat)
      //let obsIdArr = this.findWeatherInfo(this.routeLon, this.routeLat);
      let obsIdArr = this.findWeatherInfo(this.routeObs);

      const getData = () => {
        obsIdArr.then((appData) => {
          this.drawChartHour(appData);
        });
      };
      getData();

      //this.hourWeatherInfo();
      //console.log(this.obsId);
    },
  },
  data() {
    return {
      dialog: true,
      bodyDiv: false,
      obsId: "",
      obsNm: "",
      resultHour: [],
      resultDay: [],
      resultMonth: [],
      resultData: null,
      selectedSign: "시간별",
      listGub: [{ GUBUN: "시간별" }, { GUBUN: "일별" }, { GUBUN: "월별" }],
    };
  },
  mounted() {
    console.log("routeObs", this.routeObs);
    let obsIdArr = this.findWeatherInfo(this.routeObs);

    const getData = () => {
      obsIdArr.then((appData) => {
        this.drawChartHour(appData);
      });
    };
    getData();
    //this.dialog = false;
    //this.bodyDiv = true;
  },
  methods: {
    closeTemper() {
      this.$parent.closeTemper();
    },
    createChart(chartData) {
      //console.log(chartData.options);
      let charStatus = Chart.getChart("temperChart");
      if (charStatus != undefined) {
        charStatus.destroy();
      }

      const ctx = document.getElementById("temperChart");
      const myChart = new Chart(ctx, {
        type: chartData.type,
        data: chartData.data,
        options: chartData.options,
      });
    },
    chartDataSet(data) {
      this.resultData = {
        type: "line",
        data: {
          labels: Object.keys(data[0]),
          datasets: [
            {
              label: "수온평균",
              backgroundColor: "#46B8FF",
              borderColor: "#46B8FF",
              data: Object.values(data[0]),
            },
            {
              label: "유속평균",
              backgroundColor: "#A696CD",
              borderColor: "#A696CD",
              data: Object.values(data[1]),
            },
            {
              label: "염분평균",
              backgroundColor: "#13C7A3",
              borderColor: "#13C7A3",
              data: Object.values(data[2]),
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: {
                boxWidth: 8,
                padding: 10,
                usePointStyle: true,
                pointStyle: "circle",
                font: { size: 13 },
              },
              fullSize: true,
              align: "center",
            },
            tooltip: { boxWidth: 15, bodyFont: { size: 14 } },
          },
          responsive: true,
          maintainAspectRatio: false, //가로세로비율
          layout: { padding: { top: 30, bottom: 30, right: 10 } },
          elements: { arc: { borderWidth: 2 } },
        },
      };
    },
    clearGun() {
      this.selectedSign = "";
    },
    async findWeatherInfo(routeObs) {
      //console.log(routeObs);
      let obsId;
      await this.$http
        .get(`/api/ship/weatherInfo/${routeObs}`)
        .then(async (res) => {
          //console.log(res.data);
          obsId = res.data[0].obs_post_id;
          this.obsId = res.data[0].obs_post_id;
          this.obsNm = res.data[0].obs_post_name;
        });
      return obsId;
      /*await this.$http.get(`/api/ship/weatherInfo/${lon}/${lat}`).then(async (res) => {  
                obsId = res.data[0].id; 
                this.obsId = res.data[0].id; 
                this.obsNm = res.data[0].name;
                console.log(res.data[0]);
                // await this.$http.get(`/api/ship/weatherInfoHour/${obsId}`).then((res) => {  
                //     //console.log(res.data);
                //     this.resultHour = res.data; 
                // });

                // await this.$http.get(`/api/ship/weatherInfoDay/${obsId}`).then((res) => {  
                //     //console.log(res.data);
                //     this.resultDay = res.data; 
                // });

                // await this.$http.get(`/api/ship/weatherInfoMonth/${obsId}`).then((res) => {  
                //     //console.log(res.data);
                //     this.resultMonth = res.data; 
                // });
            });

            return obsId;*/
    },
    chartChange() {
      if (this.selectedSign == "시간별") {
        this.drawChartHour(this.obsId);
      } else if (this.selectedSign == "일별") {
        this.drawChartDay(this.obsId);
      } else if (this.selectedSign == "월별") {
        this.drawChartMonth(this.obsId);
      }
    },
    async drawChartHour(obsId) {
      //console.log(obsId.obs_post_id);
      let resultD;
      await this.$http.get(`/api/ship/weatherInfoHour/${obsId}`).then((res) => {
        //console.log(res.data);
        resultD = res.data;
      });

      this.chartDataSet(resultD);
      this.createChart(this.resultData);
    },
    async drawChartDay(obsId) {
      let resultD;
      await this.$http.get(`/api/ship/weatherInfoDay/${obsId}`).then((res) => {
        //console.log(res.data);
        resultD = res.data;
      });

      //console.log(resultD);

      this.chartDataSet(resultD);
      this.createChart(this.resultData);
    },
    async drawChartMonth(obsId) {
      let resultD;
      await this.$http
        .get(`/api/ship/weatherInfoMonth/${obsId}`)
        .then((res) => {
          //console.log(res.data);
          resultD = res.data;
        });

      this.chartDataSet(resultD);
      this.createChart(this.resultData);
    },
  },
};
</script>

<style>
.chartC {
  height: 300px;
}

.cboC {
  position: absolute;
  right: 40px;
}

.cboC2 {
  position: absolute;
  padding: 10px;
  font-weight: bold;
}

#temperChart {
  background: rgba(255, 255, 255, 0.8);
}

.selectSt {
  height: 100px;
  width: 80px;
  border-radius: 50px;
  background: #fff;
  margin: 8px;
  padding: 10px 12px;
  box-shadow: 0 1.5px 3px rgb(0 0 0 / 25%);
  height: 35px;
  color: #787878;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  font-family: "Nanum Gothic", sans-serif;
  font-size: 12px;
}

.closeBtn_chart {
  position: absolute;
  right: 9px;
  top: 10px;
}
</style>
