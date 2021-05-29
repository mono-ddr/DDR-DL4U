<template>
  <div id="generator">
    <h1>Generator</h1>
    <input type=text />
    <p>{{ sa.name }}</p>
    <p>{{ sa.ddrcode }}</p>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data (){
    return {
      sa: {
        name: "", 
        ddrcode: "", 
        scores: {
          single: {},
          double: {}
        }
      }
    }
  },
  name: 'Generator',
  mounted () {
    axios
      .get('https://us-central1-mono-ddr.cloudfunctions.net/function?ddrcode=51508903')
      .then(
        response => {
          console.log(response)
          this.sa = response.data
        }
      )
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
