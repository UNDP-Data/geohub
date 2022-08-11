<script lang="ts">
</script>

<header class="header">
  <section>
    <div style="display: flex; justify-content: space-between; align-items: center">
      <div class="logo-div">
        <a href="https://undpgeohub.org" class="logo" tabIndex="0">
          <img style="height: 8vh;" src="1200px-UNDP_logo.svg-148x300.png" alt="GeoHub | UNDP" loading="lazy" />
        </a>
        <div class="site-title" style="margin-left: 5px">
          <span style="color: #006EB5" class="title">GeoHub | Dashboards</span>
        </div>
      </div>
    </div>
  </section>
</header>

<style lang="scss">
  $dark-azure: #00c1ff;
  .header {
    background-color: #f5f5f5;
    padding: 0;
    margin: 0;
    height: 8vh;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    .logo-div {
      display: flex;
      justify-content: left;
      align-items: center;
      margin-left: 1rem;
      max-width: fit-content;
    }
  }
  .icon {
    cursor: pointer;
    margin-right: 10%;
  }
  .fa-icon {
    color: $dark-azure;
  }
  .site-title {
    font-size: medium;
  }
</style>
