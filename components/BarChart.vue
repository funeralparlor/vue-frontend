<script>
export default {
  name: 'BarChart',
  props: {
    data: {
      type: Object,
      required: true,
      default: () => ({ labels: [], datasets: [{ data: [] }] })
    },
    height: {
      type: [Number, String],
      default: 350
    },
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    horizontal: {
      type: Boolean,
      default: false
    },
    stacked: {
      type: Boolean,
      default: false
    },
    showValues: {
      type: Boolean,
      default: true
    },
    showGrid: {
      type: Boolean,
      default: true
    },
    barRadius: {
      type: Number,
      default: 4
    },
    barColors: {
      type: Array,
      default: () => ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0']
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
    dataLabelsFormatter: {
      type: Function,
      default: (val) => val.toLocaleString()
    },
    columnWidth: {
      type: String,
      default: '70%'
    }
  },
  computed: {
    chartOptions() {
      return {
        chart: {
          type: this.horizontal ? 'bar' : 'bar',
          height: this.height,
          stacked: this.stacked,
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
            speed: 800,
            animateGradually: {
              enabled: true,
              delay: 150
            },
            dynamicAnimation: {
              enabled: true,
              speed: 350
            }
          }
        },
        plotOptions: {
          bar: {
            horizontal: this.horizontal,
            columnWidth: this.columnWidth,
            borderRadius: this.barRadius,
            dataLabels: {
              position: this.horizontal ? 'start' : 'top'
            }
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
        subtitle: {
          text: this.subtitle,
          align: 'center',
          style: {
            fontSize: '14px',
            fontWeight: 400
          }
        },
        colors: this.barColors,
        dataLabels: {
          enabled: this.showValues,
          formatter: this.dataLabelsFormatter,
          style: {
            fontSize: '12px',
            fontWeight: 500,
            colors: ['#333']
          },
          dropShadow: {
            enabled: false
          },
          offsetY: -20
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
            },
            trim: true,
            maxHeight: 120,
            rotateAlways: false
          },
          axisTicks: {
            show: true
          },
          axisBorder: {
            show: true
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
        legend: {
          position: 'top',
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
        tooltip: {
          theme: 'light',
          shared: this.stacked,
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
              },
              plotOptions: {
                bar: {
                  columnWidth: '90%'
                }
              },
              xaxis: {
                labels: {
                  rotate: -45,
                  rotateAlways: true
                }
              }
            }
          }
        ]
      };
    },
    series() {
      // Handle single dataset
      if (this.data.datasets.length === 1) {
        return [{
          name: this.data.datasets[0].label || 'Series',
          data: this.data.datasets[0].data
        }];
      }
      
      // Handle multiple datasets
      return this.data.datasets.map(dataset => ({
        name: dataset.label || 'Series',
        data: dataset.data
      }));
    }
  }
};
</script>

<template>
  <div class="bar-chart-container">
    <apexchart
      :type="horizontal ? 'bar' : 'bar'"
      :options="chartOptions"
      :series="series"
    ></apexchart>
  </div>
</template>

<style scoped>
.bar-chart-container {
  width: 100%;
  height: 100%;
}
</style>