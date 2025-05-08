//collegeform.vue
<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';
import { PlusIcon, TrashIcon } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      name: '',
      description: '',
      active: true,
      courses: []
    })
  },
  isEditing: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'submit', 'cancel']);

const college = ref({...props.modelValue});

// Add a new empty course to the courses array
const addCourse = () => {
  college.value.courses.push({
    name: '',
    description: '',
    active: true
  });
};

// Remove a course at the specified index
const removeCourse = (index) => {
  college.value.courses.splice(index, 1);
};

// Update the model when the form changes
const updateModel = () => {
  emit('update:modelValue', college.value);
};

// Watch for changes in the modelValue prop
watch(() => props.modelValue, (newValue) => {
  college.value = {...newValue};
}, { deep: true });

// Initialize with at least one course if creating a new college
if (!props.isEditing && college.value.courses.length === 0) {
  addCourse();
}

// Handle form submission
const handleSubmit = () => {
  emit('submit', college.value);
};
</script>

<template>
  <div class="college-form">
    <form @submit.prevent="handleSubmit">
      <!-- College Information -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-4">College Information</h3>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1" for="college-name">
            College Code
          </label>
          <input
            id="college-name"
            v-model="college.name"
            type="text"
            class="w-full p-2 border border-gray-300 rounded"
            required
            @input="updateModel"
          />
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1" for="college-description">
            College Name
          </label>
          <textarea
            id="college-description"
            v-model="college.description"
            class="w-full p-2 border border-gray-300 rounded"
            rows="3"
            @input="updateModel"
          ></textarea>
        </div>
        
        <div class="mb-4">
          <label class="flex items-center">
            <input
              v-model="college.active"
              type="checkbox"
              class="mr-2"
              @change="updateModel"
            />
            <span class="text-sm font-medium text-gray-700">Active</span>
          </label>
        </div>
      </div>
      
      <!-- Courses Section -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Courses</h3>
          <button
            type="button"
            class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            @click="addCourse"
          >
            <PlusIcon class="w-4 h-4 mr-1" />
            <span>Add Course</span>
          </button>
        </div>
        
        <!-- Course list -->
        <div
          v-for="(course, index) in college.courses"
          :key="index"
          class="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"
        >
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">Course {{ index + 1 }}</h4>
            <button
              type="button"
              class="text-red-600 hover:text-red-800"
              @click="removeCourse(index)"
            >
              <TrashIcon class="w-5 h-5" />
            </button>
          </div>
          
          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-1" :for="`course-name-${index}`">
              Course Name
            </label>
            <input
              :id="`course-name-${index}`"
              v-model="course.name"
              type="text"
              class="w-full p-2 border border-gray-300 rounded"
              required
              @input="updateModel"
            />
          </div>
          
          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-1" :for="`course-description-${index}`">
              Description
            </label>
            <textarea
              :id="`course-description-${index}`"
              v-model="course.description"
              class="w-full p-2 border border-gray-300 rounded"
              rows="2"
              @input="updateModel"
            ></textarea>
          </div>
          
          <div>
            <label class="flex items-center">
              <input
                v-model="course.active"
                type="checkbox"
                class="mr-2"
                @change="updateModel"
              />
              <span class="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>
        
        <!-- Empty state -->
        <div
          v-if="college.courses.length === 0"
          class="text-center p-6 border border-dashed border-gray-300 rounded-lg"
        >
          <p class="text-gray-500 mb-2">No courses added yet</p>
          <button
            type="button"
            class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            @click="addCourse"
          >
            Add Your First Course
          </button>
        </div>
      </div>
      
      <!-- Form buttons -->
      <div class="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {{ isEditing ? 'Update' : 'Create' }}
        </button>
      </div>
    </form>
  </div>
</template>