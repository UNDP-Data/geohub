import "../bulma.scss";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="p-2">
  <button class="button is-primary">Primary color Button</button>

  <button class="button is-link">Secondary color Button</button>

  <br>
  <br>

  <input class="input" type="text" placeholder="Text input">

  <br>
  <br>

  <div class="control">
    <input class="input" type="text" placeholder="Disabled input" disabled>
  </div>

  <br>
  <br>
  
  <div class="control has-icons-left has-icons-right">
    <input class="input" type="email" placeholder="Email">
    <span class="icon is-small is-left">
      <i class="fas fa-envelope"></i>
    </span>
    <span class="icon is-small is-right">
      <i class="fas fa-check"></i>
    </span>
  </div>

  <br>
  <br>

  <textarea class="textarea" placeholder="e.g. Hello world"></textarea>

  </div>
`;
