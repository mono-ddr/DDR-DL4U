<template>
  <v-app>
    <v-main>
      <Generator />
      <Links />
    </v-main>
  </v-app>
</template>

<script>
import Generator from './components/Generator.vue'
import Links from './components/Links.vue'
export default {
  name: 'App',

  components: {
    Generator,
    Links,
  },
  data: () => ({
    //
  }),
};
</script>
