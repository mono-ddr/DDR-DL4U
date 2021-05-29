<template>
  <div id="app">
    <Generator />
    <Links />
  </div>
</template>

<script>
import Generator from './components/Generator.vue'
import Links from './components/Links.vue'

export default {
  name: 'App',
  components: {
    Generator,
    Links,
  }
}

</script>

<style>
#app {
}
</style>
