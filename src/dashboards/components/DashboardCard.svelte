<script lang="ts">
  export let title = 'Electricity Dashboard'
  export let link
  export let description = 'GeoHub Electricity Dashboard'
</script>

<div class="cell medium-4" style="width: fit-content; margin: 2% auto auto 2%;">
  <div class="content-card">
    <a href={link}>
      <h6>{title}</h6>
      <div class="image">
        <img style="width: 350px; height: 200px;" src="electricity-snapshot.jpg" alt="electricity-snapshot.jpg" />
      </div>
      <div class="content-caption">
        <h5>{description}</h5>
        <span class="cta__link cta--space">
          Open Dashboard
          <i />
        </span>
      </div>
    </a>
  </div>
</div>

<style lang="scss">
  @import '../../styles/undp-design/base-minimal.min.css';
  @import '../../styles/undp-design/cta-link.min.css';
  @import '../../styles/undp-design/content-card.min.css';
  @import '../../styles/undp-design/buttons.min.css';
</style>
