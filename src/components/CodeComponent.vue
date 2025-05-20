<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  code: String
})

function copyToClipboard() {
  navigator.clipboard.writeText(props.code)
}
</script>

<template>
  <div class="code-box">
    <img src="../../public/copy_icon.svg" @click="copyToClipboard"></img>
    <pre><code>{{ code }}</code></pre>

  </div>
</template>

<style scoped>
.code-box {
  background: #282c34;
  color: #fff;
  padding: 1rem;
  border-radius: 8px;
  position: relative;
  overflow-x: auto;
}

img {
  position: absolute;
  right: 10px;
  margin-top: 0.5rem;
  background: #afafaf;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  fill: white;
  color: white;
}

img:hover {
  background: #21a1f1;
}
</style>
