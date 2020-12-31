<script>
import Vue from 'vue';
import { DocRendererSample } from '@/entry';

export default Vue.extend({
  name: 'ServeDev',
  components: {
    DocRendererSample,
  }
});
</script>

<template>
  <div id="app">
    <doc-renderer-sample />
  </div>
</template>
