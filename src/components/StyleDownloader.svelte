<script lang="ts">
  import Fa from 'svelte-fa'
  import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload'
  import { map } from '../stores'

  export const download = () => {
    const style = $map.getStyle()
    const styleJSON = JSON.stringify(style, null, 2)
    const a = document.createElement('a')
    const file = new Blob([styleJSON], { type: 'application/json' })
    a.href = URL.createObjectURL(file)
    a.download = 'style.json'
    a.click()
  }
</script>

<div class="icon" on:click={() => download()}>
  <Fa icon={faDownload} size="lg" />
</div>

<style lang="scss">
  .icon {
    cursor: pointer;
    margin-right: 20px;
  }
</style>
