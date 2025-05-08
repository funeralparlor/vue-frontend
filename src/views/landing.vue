<template>
  <main class="flex h-screen overflow-hidden">
    <!-- Left panel with gradient and content -->
    <section class="w-1/2 bg-gradient-to-br from-blue-900 to-indigo-200 p-12 flex flex-col">
      <!-- Header with logo -->
      <header class="flex items-center">
        <img class="h-8 w-8 rounded" src="/bulsu_red.png" alt="BulSU logo" />
        <span class="ml-3 text-white font-medium">Bulacan State University</span>
      </header>
      
      <!-- Main content -->
      <div class="flex-grow flex items-center">
        <div>
          <h1 class="text-4xl md:text-5xl font-bold text-white leading-tight">
            Student
            <span class="text-blue-200">Scholarship</span>
            <br/>Management
          </h1>
          
          <p class="mt-4 text-gray-300 font-light">
            
          </p>
          
          <!-- Stats in a cleaner grid -->
          <div class="mt-10 grid grid-cols-3 gap-4">
            <div v-for="(stat, index) in statistics" :key="index">
              <div class="text-2xl font-bold text-blue-200">{{ stat.value }}</div>
              <div class="text-sm text-gray-300 mt-1">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Right panel with image and overlay -->
    <section class="w-1/2 relative">
      <img 
        :src="campusImage" 
        alt="University campus" 
        class="object-cover w-full h-full absolute inset-0"
        @error="handleImageError"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-black/10"></div>
      
      <!-- Login button -->
      <div class="absolute top-12 right-12">
        <router-link 
          to="/login" 
          class="px-6 py-2 rounded-full bg-white text-blue-900 font-medium hover:bg-opacity-90 transition-colors"
        >
          Log In
        </router-link>
      </div>
      
      <!-- Fallback if image fails -->
      <div v-if="imageError" class="absolute inset-0 flex items-center justify-center text-white/70">
        <span>Campus image</span>
      </div>
      
      <!-- Tagline -->
      <div class="absolute bottom-12 left-12 right-12">
        <p class="text-white text-xl font-light">
          
        </p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue';

// Image handling
const campusImage = ref('/huh.jpg');
const imageError = ref(false);

// Handle image loading errors
const handleImageError = () => {
  imageError.value = true;
};

// Statistics data
const statistics = ref([
 
]);
</script>