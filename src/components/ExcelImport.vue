<template>
  <div>
    <input type="file" @change="handleFile" accept=".xlsx,.xlsm,.xls">
    <button @click="submitFile" :disabled="!file">Import</button>
    
    <div v-if="errors.length">
      <h3>Import Errors:</h3>
      <div v-for="(error, index) in errors" :key="index">
        Row {{ error.row }}: {{ error.errors.join(', ') }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      file: null,
      errors: []
    }
  },
  methods: {
    handleFile(event) {
      this.file = event.target.files[0];
    },
    async submitFile() {
      if (!this.file) return;

      const formData = new FormData();
      formData.append('file', this.file);

      try {
        const response = await axios.post('/api/students/import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        this.errors = [];
        alert(response.data.message);
      } catch (error) {
        if (error.response?.data?.errors) {
          this.errors = error.response.data.errors;
        } else {
          alert('An error occurred during import');
        }
      }
    }
  }
}
</script>