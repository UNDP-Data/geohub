<script lang="ts">
  const currentYear = new Date().getFullYear()
</script>

<footer class="footer">
  <div class="grid-x">
    <div class="cell medium-10 medium-offset-1">
      <div class="grid-x footer-head">
        <div class="cell medium-5">
          <div class="footer-logo">
            <a href="https://www.undp.org">
              <img
                src="undp-images/undp-logo-white.svg"
                alt="UNDP Logo" />
            </a>
            <h5 tabindex="0">
              United Nations
              <br />
              Development Programme
            </h5>
          </div>
        </div>
      </div>

      <div class="footer-copyright">
        <p tabindex="0">© {currentYear} United Nations Development Programme</p>
      </div>
    </div>
  </div>
</footer>

<style lang="scss">
  @import '../../styles/undp-design/base-minimal.min.css';
  @import '../../styles/undp-design/footer.min.css';
</style>
