<script lang="ts">
  import { page } from '$app/stores'
  import Notification from '$components/controls/Notification.svelte'
</script>

<div class="container m-4 error-container">
  <Notification
    type="danger"
    showCloseButton={false}>
    <p class="title is-4">Whoops! Something wrong!</p>
    <p class="subtitle is-5 has-text-justified pt-4">{$page.error.message}</p>
    <p class="subtitle is-5 has-text-justified">Please contact administrator.</p>
  </Notification>
</div>

<style
  global
  lang="scss">
  @import '../styles/geohubstyle.scss';
  @import 'https://use.fontawesome.com/releases/v6.1.1/css/all.css';

  body,
  html {
    font-family: ProximaNova, sans-serif;
    font-size: 13px;
  }

  .error-container {
    width: 30%;
  }
</style>
