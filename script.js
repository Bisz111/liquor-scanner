const resultDiv = document.getElementById("result");

function handleResult(data) {
  fetch(`/api/lookup?upc=${data}`)
    .then(res => res.json())
    .then(info => {
      if (info.error) {
        resultDiv.innerHTML = `<p>Not found.</p>`;
      } else {
        resultDiv.innerHTML = `
          <h2>${info.title}</h2>
          <img src="${info.image}" width="150"/>
          <p>${info.description}</p>
          <p><strong>Pairs well with:</strong> ${info.pairs}</p>
        `;
      }
    });
}

function manualSearch() {
  const upc = document.getElementById("manualUPC").value;
  handleResult(upc);
}

new Html5Qrcode("reader").start(
  { facingMode: "environment" },
  {
    fps: 10,
    qrbox: 250
  },
  (decodedText) => {
    new Html5Qrcode("reader").stop();
    handleResult(decodedText);
  }
);
