<script lang="ts">
  export let title: string
  export let link: string

  // This should not be hardcoded
  export let description = 'Electricity Access for populations all over the world'
  import Ripple from '@smui/ripple'
</script>

<a class="dashboard-card-link" href={link} style="max-width: 20%; min-width: 300px; padding: 20px; ">
  <div class="card one-page" style="background: white;">
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
      <div class="content">{description}</div>
    </div>
    <footer class="card-footer" use:Ripple={{ surface: true }}>
      <a href={link} class="card-footer-item">Open {title} dashboard</a>
    </footer>
  </div>
</a>

<style lang="scss">
  @import 'https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css';

  .one-page {
    width: 100%;
    cursor: pointer;
    border-radius: 10px;
    @media (prefers-color-scheme: dark) {
      border: solid 0.5px #212125;
      background: #212125;
    }
  }
  .one-page:hover {
    background: mintcream !important;
  }
  .dashboard-image:hover {
    webkit-filter: blur(4px); /* Chrome, Safari, Opera */
    filter: blur(4px);
  }
  .dashboard-image {
    filter: grayscale(100%);
    -webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
  }
  .card-header {
    background: darkslategrey;
  }
  .card-header-title {
    font-family: ProximaNova, sans-serif;
    text-transform: capitalize;
    color: white;
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
    border-top: 1px solid grey;
    .card-footer-item {
      color: white;
    }
    .card-footer-item {
      color: darkslategrey;
    }
    .card-footer-item:hover {
      color: #4a4a4a;
    }
  }
</style>
