<script>
export default {
  name: 'MixedChart',
  props: {
    data: {
      type: Object,
      required: true,
      /* Expected format:
        {
          labels: ['Jan', 'Feb', ...],
          datasets: [
            {
              name: 'Series 1',
              type: 'column', // 'column', 'line', 'area'
              data: [44, 55, 57, 56, 61, 58, 63]
            },
            {
              name: 'Series 2',
              type: 'line',
              data: [76, 85, 101, 98, 87, 105, 91]
            }
          ]
        }
      */
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
    xAxisTitle: {
      type: String,
      default: ''
    },
    yAxisTitle: {
      type: String,
      default: ''
    },
    colors: {
      type: Array,
      default: () => ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0']
    },
    stacked: {
      type: Boolean,
      default: false
    },
    showDataLabels: {
      type: Boolean,
      default: false
    },
    showGrid: {
      type: Boolean,
      default: true
    },
    enableAnimations: {
      type: Boolean,
      default: true
    },
    enableZoom: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    chartOptions() {
      return {
        chart: {
          type: 'line',
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
            }
          },
          dropShadow: {
            enabled: true,
            opacity: 0.1,
            blur: 3,
            left: 1,
            top: 1
          }
        },
        stroke: {
          width: this.getStrokeWidths(),
          curve: 'smooth',
          dashArray: this.getDashArrays()
        },
        fill: {
          opacity: this.getFillOpacities(),
          type: this.getFillTypes()
        },
        markers: {
          size: this.getMarkerSizes(),
          strokeWidth: 0,
          hover: {
            size: 7
          }
        },
        dataLabels: {
          enabled: this.showDataLabels,
          style: {
            fontSize: '12px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontWeight: 'bold'
          },
          background: {
            enabled: true,
            foreColor: '#fff',
            padding: 4,
            borderRadius: 2,
            borderWidth: 1,
            borderColor: '#fff',
            opacity: 0.9
          }
        },
        colors: this.colors,
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
        xaxis: {
          categories: this.data.labels || [],
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
          },
          tooltip: {
            enabled: true
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
          shared: true,
          intersect: false,
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
        plotOptions: {
          bar: {
            columnWidth: '70%',
            borderRadius: 4
          }
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
      // Convert to format expected by ApexCharts
      return this.data.datasets.map((dataset, index) => ({
        name: dataset.name || `Series ${index + 1}`,
        type: this.getApexChartType(dataset.type),
        data: dataset.data
      }));
    }
  },
  methods: {
    getApexChartType(type) {
      // Convert our type names to ApexCharts type names
      switch (type) {
        case 'column':
        case 'bar':
          return 'bar';
        case 'area':
          return 'area';
        case 'line':
        default:
          return 'line';
      }
    },
    getStrokeWidths() {
      return this.data.datasets.map(dataset => {
        const type = dataset.type || 'line';
        if (type === 'line') return 3;
        if (type === 'area') return 2;
        return 0; // For columns/bars
      });
    },
    getDashArrays() {
      return this.data.datasets.map(dataset => {
        return dataset.dashed ? 5 : 0;
      });
    },
    getFillOpacities() {
      return this.data.datasets.map(dataset => {
        const type = dataset.type || 'line';
        if (type === 'area') return 0.2;
        if (type === 'line') return 0;
        return 1; // For columns/bars
      });
    },
    getFillTypes() {
      return this.data.datasets.map(dataset => {
        return dataset.fillType || 'solid';
      });
    },
    getMarkerSizes() {
      return this.data.datasets.map(dataset => {
        const type = dataset.type || 'line';
        if (type === 'line' || type === 'area') return 5;
        return 0; // No markers for columns/bars
      });
    }
  }
};
</script>

<template>
  <div class="mixed-chart-container">
    <apexchart
      type="line"
      :options="chartOptions"
      :series="series"
    ></apexchart>
  </div>
</template>

<style scoped>
.mixed-chart-container {
  width: 100%;
  height: 100%;
}
</style>