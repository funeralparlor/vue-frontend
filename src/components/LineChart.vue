<script>
// LineChart.vue
export default {
  name: 'LineChart',
  props: {
    data: {
      type: Object,
      required: true,
      default: () => ({ labels: [], datasets: [] })
    },
    height: {
      type: [Number, String],
      default: 350
    },
    title: {
      type: String,
      default: ''
    },
    xAxisTitle: {
      type: String,
      default: ''
    },
    yAxisTitle: {
      type: String,
      default: ''
    },
    enableZoom: {
      type: Boolean,
      default: false
    },
    enableAnimations: {
      type: Boolean,
      default: true
    },
    lineWidth: {
      type: Number,
      default: 3
    },
    showMarkers: {
      type: Boolean,
      default: true
    },
    markerSize: {
      type: Number,
      default: 5
    },
    showGrid: {
      type: Boolean,
      default: true
    },
    legendPosition: {
      type: String,
      default: 'top',
      validator: value => ['top', 'right', 'bottom', 'left'].includes(value)
    }
  },
  computed: {
    chartOptions() {
      return {
        chart: {
          type: 'line',
          height: this.height,
          toolbar: {
            show: this.enableZoom,
            tools: {
              download: true,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true
            }
          },
          animations: {
            enabled: this.enableAnimations,
            easing: 'easeinout',
            speed: 800
          },
          dropShadow: {
            enabled: true,
            top: 5,
            left: 0,
            blur: 3,
            opacity: 0.1
          }
        },
        title: {
          text: this.title,
          align: 'center',
          style: {
            fontSize: '16px',
            fontWeight: 600
          }
        },
        xaxis: {
          categories: this.data.labels,
          title: {
            text: this.xAxisTitle,
            style: {
              fontSize: '14px',
              fontWeight: 500
            }
          },
          labels: {
            style: {
              fontSize: '12px'
            }
          }
        },
        yaxis: {
          title: {
            text: this.yAxisTitle,
            style: {
              fontSize: '14px',
              fontWeight: 500
            }
          },
          labels: {
            formatter: (value) => value.toLocaleString()
          }
        },
        colors: this.data.datasets.map((dataset, index) => {
          const colors = ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0'];
          return dataset.backgroundColor || colors[index % colors.length];
        }),
        legend: {
          position: this.legendPosition,
          horizontalAlign: 'center',
          fontSize: '14px',
          markers: {
            width: 12,
            height: 12,
            radius: 12
          },
          itemMargin: {
            horizontal: 10,
            vertical: 5
          }
        },
        stroke: {
          width: this.lineWidth,
          curve: 'smooth',
          lineCap: 'round'
        },
        markers: {
          size: this.showMarkers ? this.markerSize : 0,
          strokeWidth: 0,
          hover: {
            size: this.showMarkers ? this.markerSize + 2 : 0
          }
        },
        tooltip: {
          theme: 'light',
          y: {
            formatter: (val) => val.toLocaleString()
          }
        },
        grid: {
          show: this.showGrid,
          borderColor: '#f1f1f1',
          strokeDashArray: 0,
          position: 'back'
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                height: 300
              },
              legend: {
                position: 'bottom'
              }
            }
          }
        ]
      };
    },
    series() {
      return this.data.datasets.map(dataset => ({
        name: dataset.label || 'Series',
        data: dataset.data
      }));
    }
  }
};
</script>

<template>
  <div class="line-chart-container">
    <apexchart
      type="line"
      :options="chartOptions"
      :series="series"
    ></apexchart>
  </div>
</template>

<style scoped>
.line-chart-container {
  width: 100%;
  height: 100%;
}
</style>