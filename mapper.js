const generate = document.querySelector("#generate");

generate.addEventListener("click", () => {
  fetch("./similarLogos.json")
    .then((res) => res.json())
    .then((data) => {
      const container = document.querySelector(".container");

      data.forEach((element) => {
        const li = document.createElement("li");
        const name = element.file.replace("logo_", "").replace(".png", "");
        li.innerHTML = `<div class="logosContainer">
      
      <a href="https://${name}" target=_blank>
        <img src="./logos_normalized/${element.file}" alt="${
          element.file
        }" width="128" />
      </a>
        <ul class="similarsContainer">
          ${element.similarTo
            .map((img) => {
              return `<li>
             <a href="https://${img
               .replace("logo_", "")
               .replace(".png", "")}" target=_blank>
              <img src="./logos_normalized/${img}" width="64"></img>
            </a>
            </li>`;
            })
            .join("")}
        </ul>
      </div>`;
        container.appendChild(li);
      });
    });
});
