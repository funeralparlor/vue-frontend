<template>
  <div class="chart-wrapper">
    <div class="chart-controls" v-if="enableControls">
      <select v-model="chartType" class="chart-type-select">
        <option value="pie">Pie Chart</option>
        <option value="donut">Donut Chart</option>
        <option value="radialBar">Radial Bar</option>
        <option value="polarArea">Polar Area</option>
      </select>
      
      <div class="chart-toggle">
        <label class="toggle-label">
          <input type="checkbox" v-model="showLegend">
          <span>Show Legend</span>
        </label>
      </div>
    </div>
    
    <div class="chart-container" :class="{ 'no-data': !hasData }">
      <apexchart
        v-if="hasData"
        :type="chartType"
        :options="chartOptions"
        :series="series"
        :height="height"
      ></apexchart>
      <div v-else class="no-data-message">
        <span>No data available</span>
      </div>
    </div>
    
    <div class="chart-legend" v-if="showTotals && hasData">
      <div class="legend-title">Total: {{ totalValue }}</div>
      <div class="legend-items">
        <div v-for="(value, index) in series" :key="index" class="legend-item">
          <span class="legend-color" :style="{ backgroundColor: colors[index % colors.length] }"></span>
          <span class="legend-label">{{ data.labels[index] }}</span>
          <span class="legend-value">{{ value.toLocaleString() }} ({{ ((value / totalValue) * 100).toFixed(1) }}%)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EnhancedChartComponent',
  props: {
    data: {
      type: Object,
      required: true,
      default: () => ({ labels: [], datasets: [{ data: [] }] })
    },
    height: {
      type: [String, Number],
      default: 350
    },
    colors: {
      type: Array,
      default: () => ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8']
    },
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    defaultType: {
      type: String,
      default: 'pie',
      validator: value => ['pie', 'donut', 'radialBar', 'polarArea'].includes(value)
    },
    enableControls: {
      type: Boolean,
      default: true
    },
    showTotals: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      chartType: this.defaultType,
      showLegend: true,
      animation: true
    };
  },
  computed: {
    hasData() {
      return this.series && this.series.length > 0 && this.series.some(val => val > 0);
    },
    totalValue() {
      return this.series.reduce((sum, current) => sum + current, 0);
    },
    series() {
      return this.data?.datasets?.[0]?.data || [];
    },
    chartOptions() {
      const options = {
        chart: {
          type: this.chartType,
          fontFamily: 'inherit',
          toolbar: {
            show: false
          },
          animations: {
            enabled: this.animation,
            speed: 800,
            dynamicAnimation: {
              enabled: true
            }
          }
        },
        colors: this.colors,
        labels: this.data?.labels || [],
        legend: {
          show: this.showLegend,
          position: 'bottom',
          horizontalAlign: 'center',
          floating: false,
          fontSize: '14px',
          offsetY: 10,
          markers: {
            width: 12,
            height: 12,
            strokeWidth: 0,
            radius: 12,
            offsetX: -3
          },
          itemMargin: {
            horizontal: 10,
            vertical: 5
          }
        },
        tooltip: {
          enabled: true,
          theme: 'light',
          y: {
            formatter: (val) => {
              return `${val.toLocaleString()} (${((val / this.totalValue) * 100).toFixed(1)}%)`;
            }
          }
        },
        stroke: {
          width: 1,
          colors: ['#fff']
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                height: 300
              },
              legend: {
                position: 'bottom',
                offsetY: 0
              }
            }
          }
        ],
        plotOptions: {
          pie: {
            expandOnClick: true,
            donut: {
              size: '65%',
              labels: {
                show: this.chartType === 'donut',
                name: {
                  show: true,
                  fontSize: '16px'
                },
                value: {
                  show: true,
                  fontSize: '20px',
                  formatter: (val) => val.toLocaleString()
                },
                total: {
                  show: true,
                  fontSize: '16px',
                  label: 'Total',
                  formatter: () => this.totalValue.toLocaleString()
                }
              }
            }
          },
          polarArea: {
            rings: {
              strokeWidth: 1,
              strokeColor: '#fff'
            },
            spokes: {
              strokeWidth: 1,
              connectorColors: '#fff'
            }
          },
          radialBar: {
            hollow: {
              size: '60%'
            },
            dataLabels: {
              name: {
                fontSize: '16px',
                color: '#333',
                offsetY: -10
              },
              value: {
                fontSize: '22px',
                show: true,
                formatter: (val) => `${val}%`
              },
              total: {
                show: true,
                label: 'Total',
                formatter: () => this.totalValue.toLocaleString()
              }
            }
          }
        },
        dataLabels: {
          enabled: this.chartType !== 'radialBar',
          formatter: (val, opts) => {
            const value = this.series[opts.seriesIndex];
            const percentage = ((value / this.totalValue) * 100).toFixed(1);
            return percentage > 5 ? `${percentage}%` : '';
          },
          style: {
            fontSize: '14px',
            fontFamily: 'inherit',
            fontWeight: 500
          },
          dropShadow: {
            enabled: false
          }
        }
      };
      
      // Add title if provided
      if (this.title) {
        options.title = {
          text: this.title,
          align: 'center',
          margin: 10,
          offsetY: 0,
          style: {
            fontSize: '18px',
            fontWeight: 'bold'
          }
        };
      }
      
      // Add subtitle if provided
      if (this.subtitle) {
        options.subtitle = {
          text: this.subtitle,
          align: 'center',
          margin: 10,
          offsetY: 30,
          style: {
            fontSize: '14px',
            fontWeight: 'normal'
          }
        };
      }
      
      return options;
    }
  },
  watch: {
    defaultType: {
      immediate: true,
      handler(newVal) {
        this.chartType = newVal;
      }
    }
  },
  methods: {
    updateChartType(type) {
      this.chartType = type;
      this.animation = false;
      setTimeout(() => {
        this.animation = true;
      }, 50);
    }
  }
};
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0 0.5rem;
}

.chart-type-select {
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.chart-toggle {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
}

.toggle-label input {
  margin-right: 0.5rem;
}

.chart-container {
  flex-grow: 1;
  min-height: 250px;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.no-data-message {
  color: #aaa;
  font-style: italic;
  text-align: center;
  padding: 2rem;
}

.chart-legend {
  margin-top: 1rem;
  padding: 1rem;
  border-top: 1px solid #f0f0f0;
}

.legend-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background-color: #f5f5f5;
  font-size: 0.9rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.legend-label {
  margin-right: 0.5rem;
  font-weight: 500;
}

.legend-value {
  color: #666;
}
</style>