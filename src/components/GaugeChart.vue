<script>
export default {
  name: 'GaugeChart',
  props: {
    value: {
      type: Number,
      required: true,
      default: 0
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    title: {
      type: String,
      default: ''
    },
    formatter: {
      type: Function,
      default: (val) => `${val}%`
    },
    color: {
      type: String,
      default: '#00E396'
    },
    height: {
      type: [Number, String],
      default: 350
    },
    showRange: {
      type: Boolean,
      default: true
    },
    rangeLabels: {
      type: Array,
      default: () => ['Min', 'Max']
    },
    thresholds: {
      type: Array,
      default: () => [
        {
          value: 25,
          color: '#FF4560'
        },
        {
          value: 50,
          color: '#FEB019'
        },
        {
          value: 75,
          color: '#00E396'
        }
      ]
    }
  },
  computed: {
    chartOptions() {
      return {
        chart: {
          type: 'radialBar',
          height: this.height,
          toolbar: {
            show: false
          },
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800,
            animateGradually: {
              enabled: true,
              delay: 150
            }
          }
        },
        plotOptions: {
          radialBar: {
            startAngle: -135,
            endAngle: 135,
            hollow: {
              margin: 0,
              size: '70%'
            },
            track: {
              background: "#f2f2f2",
              strokeWidth: '97%',
              margin: 5,
              dropShadow: {
                enabled: false
              }
            },
            dataLabels: {
              name: {
                show: true,
                fontSize: '16px',
                fontWeight: 600,
                offsetY: -10
              },
              value: {
                show: true,
                fontSize: '30px',
                fontWeight: 400,
                formatter: this.formatter
              },
              total: {
                show: this.showRange,
                label: this.title,
                formatter: () => this.formatter(this.value)
              }
            }
          }
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'horizontal',
            shadeIntensity: 0.5,
            gradientToColors: [this.getColorForValue(this.value)],
            inverseColors: true,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 100]
          }
        },
        stroke: {
          lineCap: 'round'
        },
        labels: [this.title],
        colors: [this.getColorForValue(this.value)],
        title: {
          text: this.title,
          align: 'center',
          style: {
            fontSize: '16px',
            fontWeight: 600
          }
        }
      };
    },
    series() {
      // Convert value to percentage based on min and max
      const percentage = ((this.value - this.min) / (this.max - this.min)) * 100;
      return [Math.round(percentage)];
    }
  },
  methods: {
    getColorForValue(value) {
      // Convert value to percentage
      const percentage = ((value - this.min) / (this.max - this.min)) * 100;
      
      // Find the color based on thresholds
      for (let i = 0; i < this.thresholds.length; i++) {
        if (percentage <= this.thresholds[i].value) {
          return this.thresholds[i].color;
        }
      }
      
      // Return the color for the highest threshold
      return this.thresholds[this.thresholds.length - 1].color;
    }
  }
};
</script>

<template>
  <div class="gauge-chart-container">
    <apexchart
      type="radialBar"
      :options="chartOptions"
      :series="series"
    ></apexchart>
    
    <div v-if="showRange" class="gauge-range">
      <span>{{ formatter(min) }}</span>
      <span>{{ formatter(max) }}</span>
    </div>
  </div>
</template>

<style scoped>
.gauge-chart-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.gauge-range {
  display: flex;
  justify-content: space-between;
  margin-top: -20px;
  padding: 0 15%;
  font-size: 14px;
  color: #666;
}
</style>