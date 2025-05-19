<script>
import router from "../router/index.js";

export default {
  methods:{
    PushToPython(){
      router.push({path:"/python"})
    },
    PushToSharp(){
      router.push({path:"/sharp"})
    }

  }
}
</script>

<template>
  <div class="main">
    <div class="bt_wrp">
      <button @click="PushToPython">Python</button>
      <button @click="PushToSharp">C#</button>
    </div>
  </div>
</template>

<style scoped>
.main{
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
.bt_wrp{
  display: flex;
  width: 200px;
  justify-content: space-between;
}
</style>
