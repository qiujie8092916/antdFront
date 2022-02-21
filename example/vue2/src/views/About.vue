<template>
  <div class="about">
    <h1>This is about page</h1>
    <input />
  </div>
</template>

<script>
export default {
  name: 'about',
  mounted() {
    console.log('vue2 about mount');
  },
  destroyed() {
    console.log('vue2 about destroyed');
  },
  deactivated() {
    console.log('vue2 about deactivated');
  }
};
</script>

<style scoped>
.about {
  color: #7265e6;
}
</style>
