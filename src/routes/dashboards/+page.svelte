<script lang="ts">
  import DashboardCard from '../../dashboards/components/DashboardCard.svelte'
  import DashboardHeader from '../../dashboards/components/DashboardHeader.svelte'
  import DashboardFooter from '../../dashboards/components/DashboardFooter.svelte'
  import MapStyleCardList from '../../dashboards/components/MapStyleCardList.svelte'

  let pages = [
    {
      title: 'Electricity',
      link: 'dashboards/electricity',
    },
  ]
</script>

<div style="height: 100vh!important; width: 100%; overflow-y: auto;overflow-x: hidden">
  <DashboardHeader />
  <div style="background:linear-gradient(140deg, #FBC412, #00C1FF); margin-top: 8vh; height: 22vh">
    <div style="margin-left:5%; padding-top:2%">
      <p class="title">Dashboards Gallery</p>
      <div style="width: 120px; height: 5px; background: black; " />
    </div>
  </div>
  <div class="main-section" style="height: max-content; min-height: 60vh">
    <div
      class="grid-x small-up-2 medium-up-4 large-up-6 content-card-wrapper"
      style="width: 100%; margin-left: 2%; margin-right: 2%">
      {#each pages as page}
        <DashboardCard bind:title={page.title} bind:link={page.link} />
      {/each}
    </div>
    <hr />
    <MapStyleCardList />
  </div>
  <DashboardFooter />
</div>

<style lang="scss">
  @import '../../styles/undp-design/base-minimal.min.css';
  @import '../../styles/undp-design/fonts.css';
  @import '../../styles/undp-design/footer.min.css';

  :global(.primary-button) {
    background: #d12800 !important;
    border-color: #d12800 !important;
    border-radius: 0px !important;
    color: white !important;
  }
  :global(.secondary-button) {
    background: #3288ce !important;
    border-color: #3288ce !important;
    border-radius: 0px !important;
    color: white !important;
  }
</style>
