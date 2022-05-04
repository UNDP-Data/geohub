<script lang="ts">
  export let title
  export let description
  export let link
  import Ripple from '@smui/ripple'
</script>

<div class="card one-page">
  <header class="card-header">
    <p class="card-header-title">
      {title}
      dashboard
    </p>
  </header>
  <div class="card-content">
    <div class="card-image">
      <figure class="image is-4by3">
        <img class="dashboard-image" src="electricity-snapshot.jpg" alt="Placeholder image" />
      </figure>
    </div>
    <div class="content">The description should go here and some the information about the specific dashboard</div>
  </div>
  <footer class="card-footer" use:Ripple={{ surface: true }}>
    <a href={link} class="card-footer-item">Open {title} dashboard</a>
  </footer>
</div>

<style lang="scss">
  @import 'https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css';

  .one-page {
    width: 400px;
    margin-right: 10px;
    height: 460px;
    cursor: pointer;
    border-radius: 10px;
    @media (prefers-color-scheme: dark) {
      border: solid 0.5px #212125;
      background: #212125;
    }
  }
  .dashboard-image:hover {
    webkit-filter: blur(4px); /* Chrome, Safari, Opera */
    filter: blur(4px);
  }
  .card-header-title {
    font-family: ProximaNova, sans-serif;
    text-transform: capitalize;
    color: dodgerblue;
    @media (prefers-color-scheme: dark) {
      color: white;
    }
  }
  .content {
    font-family: ProximaNova, sans-serif;
    @media (prefers-color-scheme: dark) {
      color: white;
    }
  }
  .card-footer {
    font-family: ProximaNova, sans-serif;
  }
</style>
